# Modelo de Dominio: Sistema de Procesamiento de Créditos

## Visión general

Este documento describe el modelo de dominio para un sistema event-driven de procesamiento de créditos. El modelo captura los eventos de negocio, los actores involucrados y las propiedades operativas que definen el comportamiento del sistema.

## Eventos del Dominio

### CreditOriginatedEvent

Este evento se genera cuando un crédito es aprobado y originates por uno de los originadores del sistema.

**Estructura del evento**:

```
EventType: CREDIT_ORIGINATED
Metadata:
  - eventId: string (ULID único)
  - occurredAt: Date
  - version: string (versionado del schema)
  - correlationId: string (para trazabilidad de saga)
  - causationId: string (opcional, referencia a evento anterior)

Data:
  - credit: CreditDetails
    * creditId: string
    * amount: number
    * currency: string
    * termMonths: number
    * interestRate: number
    * purpose: PERSONAL | BUSINESS | REFINANCING | CONSIGNMENT
    * installmentAmount: number
    * firstPaymentDate: Date
  
  - applicant: CreditApplicant
    * applicantId: string
    * fullName: string
    * email: string
    * documentType: CPF | CNPJ | PASSPORT
    * documentNumber: string
    * monthlyIncome: number
    * creditScore: number
  
  - originators: string[] (IDs de originadores que participaron)
  - approvedBy: string (identificador del aprobador)
  - channel: string (canal de originación)
```

**Propiedades derivadas**:
- `isHighValue()`: true si amount > threshold configurado
- `isHighRiskApplicant()`: true si creditScore < mínimo o income/amount ratio desfavorable

### FraudCheckedEvent

Este evento se genera tras la verificación antifraude del solicitante.

**Estructura del evento**:

```
EventType: FRAUD_CHECKED
Metadata:
  - eventId: string (ULID único)
  - occurredAt: Date
  - version: string
  - correlationId: string (mismo que el evento de crédito)
  - causationId: string (referencia al evento de crédito)

Data:
  - creditId: string
  - applicantId: string
  - fraudCheckId: string
  - result: FraudCheckResult
    * status: PASSED | FAILED | PENDING | ERROR
    * riskLevel: LOW | MEDIUM | HIGH | CRITICAL
    * fraudScore: number (0-100)
    * checksPerformed: string[]
    * flags: string[]
    * recommendation: APPROVE | REVIEW | REJECT
  
  - breakdown: FraudCheckBreakdown
    * identityVerification: boolean
    * addressVerification: boolean
    * incomeVerification: boolean
    * creditBureauCheck: boolean
    * velocityCheck: boolean
    * deviceFingerprintCheck: boolean
    * biometricVerification: boolean
  
  - checkedBy: string
  - processingTimeMs: number
```

**Propiedades derivadas**:
- `isApproved()`: true si status === PASSED
- `isRejected()`: true si status === FAILED
- `requiresManualReview()`: true si recommendation === REVIEW
- `isHighRisk()`: true si riskLevel === HIGH || CRITICAL

## Actores del Dominio

### CreditOriginator

El originador de créditos es responsable de evaluar y aprobar solicitudes de crédito.

**Atributos**:

```
- originatorId: string (identificador único)
- name: string (nombre comercial)
- type: OriginatorType (BANK | CREDIT_UNION | FINTECH | CORRESPONDENT)
- status: OriginatorStatus (ACTIVE | SUSPENDED | INACTIVE)
- configuration: OriginatorConfiguration
  * maxSingleCreditAmount: number
  * maxMonthlyCreditVolume: number
  * allowedCreditPurposes: string[]
  * requiresManualApproval: boolean
  * approvalThreshold: number
- metrics: OriginatorMetrics (calculados)
  * totalCreditsOriginated: number
  * totalVolumeProcessed: number
  * averageCreditScore: number
  * approvalRate: number
  * lastActivityAt: Date
```

**Comportamiento**:
- `canOriginateCredit()`: Valida si el originador puede aprobar el crédito según su configuración
- `isWithinVolumeLimit()`: Verifica si el crédito propuesto no excede el límite mensual
- `createCreditOriginatedEvent()`: Genera el evento de crédito origined
- `updateMetrics()`: Actualiza métricas tras originar un crédito

### FraudEngine (referencia conceptual)

Motor de verificación antifraude que evalúa el riesgo de cada solicitud.

**Responsabilidades**:
- Ejecutar verificación de identidad
- Verificar dirección y documentación
- Consultar bureaus de crédito
- Analizar patrones de velocidad
- Evaluar device fingerprint
- Generar score de fraude

## Propiedades Operativas

### Consistencia

- **Modelo de consistencia**: Eventual
- **Outbox pattern**: Garantiza publicación de eventos junto con persistencia de dominio
- **Idempotencia**: Mediante ULIDs y deduplicación en persistencia
- **Transacciones**: Saga distribuida con compensaciones explícitas

### Latencia

- **Target end-to-end**:
  - Kafka: < 100ms (evento publicado)
  - SQS: < 200ms (evento publicado)
- **Procesamiento de eventos**: < 50ms por evento
- **Time-out de saga**: Configurable por flujo

### Disponibilidad

- **Target de uptime**: 99.9% (3 nines)
- **Patrón de recuperación**: Circuit breaker + retry con backoff
- **Dead letter handling**: Eventos no procesables reintentados N veces luego movidos a DLQ
- **Escalabilidad**:
  - Kafka: Particiones múltiples para paralelismo
  - SQS: Múltiples colas FIFO para throughput

## Diagramas de relaciones

```
┌─────────────────┐     triggers      ┌─────────────────┐
│ CreditOriginator│──────────────────▶│CreditOriginated │
└─────────────────┘     (event)       │     Event       │
                                      └────────┬────────┘
                                               │ triggers
                                               ▼
┌─────────────────┐     triggers      ┌─────────────────┐
│  FraudEngine    │──────────────────▶│ FraudChecked    │
└─────────────────┘     (event)       │     Event       │
                                      └─────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE SAGAS                            │
├─────────────────────────────────────────────────────────────┤
│  1. CreditOriginated ──▶ 2. FraudCheck ──▶ 3. Confirm       │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  Compensate           Compensate           Compensate       │
└─────────────────────────────────────────────────────────────┘
```

## Notas de implementación

- Los eventos son inmutables una vez creados
- El correlationId conecta eventos dentro de una saga
- El causationId permite reconstruir la cadena de eventos
- Los ULIDs proporcionan orden temporal y unicidad
- Versionado de eventos permite evolución del schema

---
*Documento generado para sistema de procesamiento de créditos con arquitectura event-driven.*