# Architecture Decision Record (ADR)

## Sistema de Procesamiento de Créditos Event-Driven

**Fecha**: 2024
**Status**: Aprobado
**Contexto**: Sistema de originación de créditos con verificación antifraude

---

## ADR-001: Mensajería asíncrona con Outbox Pattern

### Contexto

El sistema requiere procesar eventos de crédito y antifraude de manera confiable. La consistencia eventual es aceptable, pero la pérdida de eventos no lo es. Se necesita garantizar que los eventos se publiquen incluso si el proceso falla entre la persistencia del dominio y la publicación.

### Decisión

Implementar el **Outbox Pattern** como mecanismo de publicación de eventos.

### Detalles técnicos

- Tabla de outbox separada del modelo de dominio
- Transacción atómica: persistencia de dominio + escritura en outbox
- Procesador de outbox consume mensajes y los publica al broker
- Retry automático con backoff exponencial + jitter
- Deduplicación mediante IDs únicos (ULID) en la tabla de outbox

### Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| Dual-write | Simple inicialmente | Sin garantía de atomicidad |
| CDC (Debezium) | No modifica lógica de dominio | Latencia adicional, complejidad operacional |
| Transacciones distribuidas | Atomicidad total | No disponible en mayoría de brokers |

### Implementación

- **DynamoDB**: Tabla single-table design con GSI para procesamiento
- **PostgreSQL**: Schema dedicado `outbox` con tabla `outbox_messages`
- Formato de mensaje: JSON con metadatos de envelope

### Estado

**Aprobado** - Implementado en `src/infrastructure/outbox/`

---

## ADR-002: Transacciones distribuidas con Saga Pattern

### Contexto

El flujo de procesamiento de créditos involucra múltiples pasos que deben ejecutarse de manera coordinada: originación del crédito, verificación antifraude, y confirmación. Si cualquier paso falla, los pasos completados deben compensarse.

### Decisión

Implementar una **Saga distribuida con orquestación** (no coreografía).

### Detalles técnicos

- **Coordinador central**: SagaCoordinatorService gestiona el flujo
- **Pasos de la saga**:
  1. Originación de crédito (CreditOriginated)
  2. Verificación antifraude (FraudChecked)
  3. Confirmación final
- **Compensaciones**: Cada paso define su operación de compensación
- **Retry**: Backoff exponencial + jitter para reintentos
- **Thundering herd**: Locks distribuidos en Redis

### Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| Coreografía | Desacoplado | Difícil de seguir, acoplamiento implícito |
| Transacciones distribuidas (2PC) | Atomicidad | No soportado por brokers de mensajería |
| Choreography con event sourcing | Trazabilidad completa | Complejidad muy alta |

### Implementación

- Coordinator en `src/infrastructure/saga/saga-coordinator.service.ts`
- Compensation handlers en `src/infrastructure/saga/compensations/`
- Retry strategy en `src/infrastructure/saga/retries/retry-strategy.service.ts`
- Redis lock en `src/infrastructure/saga/retries/redis-lock.service.ts`

### Estado

**Aprobado** - Implementado

---

## ADR-003: Selección de Message Broker

### Contexto

El sistema debe elegir entre Apache Kafka y Amazon SQS FIFO para la mensajería. La elección afecta las garantías de entrega, latencia, escalabilidad y operaciones.

### Decisión

**Arquitectura híbrida**: Kafka como bus principal, SQS FIFO para casos específicos.

### Detalles técnicos

**Kafka usado para**:
- Eventos de alto volumen (credit-originated, fraud-checked)
- Flujo principal happy-path
- Requerimientos de latencia baja (< 100ms)
- Procesamiento en batches

**SQS FIFO usado para**:
- Mensajes de compensación de saga
- Dead letter queues
- Casos donde exactly-once es crítico por diseño
- Throughput moderado (< 300/s)

### Comparación técnica

| Criterio | Kafka | SQS FIFO |
|----------|-------|----------|
| Exactly-once | Configurable | Nativo |
| Latencia | 2-5ms | 10-50ms |
| Throughput | Millones/s | 300/s base |
| Operaciones | Alto overhead | Managed (AWS) |

### Estado

**Aprobado** - Implementado con producers y consumers para ambos brokers

---

## ADR-004: Persistencia de Outbox

### Contexto

El outbox pattern requiere almacenamiento persistente. Se evaluaron opciones de bases de datos.

### Decisión

**Soporte dual**: DynamoDB y PostgreSQL como backends de outbox.

### Detalles técnicos

**DynamoDB**:
- Single-table design con atributos de outbox
- GSI para procesamiento de mensajes pendientes
- Throughput configurable (Provisioned o On-Demand)
- Ideal para arquitecturas serverless

**PostgreSQL**:
- Schema dedicado `outbox`
- Transacciones ACID para atomicidad
- Queries complejos sobre mensajes
- Ideal para equipos con expertise PostgreSQL

### Estado

**Aprobado** - Implementado en `src/infrastructure/outbox/` con abstracción de repository

---

## ADR-005: Manejo de idempotencia

### Contexto

Los reintentos pueden causar procesamiento duplicado de eventos. El sistema debe manejar esto correctamente.

### Decisión

**Idempotencia mediante ULIDs + deduplicación en persistencia**.

### Detalles técnicos

- Cada evento recibe un ULID único en el origen
- Tablas de outbox usan eventId como clave de deduplicación
- Consumers implementan check-and-set para evitar duplicados
- TTL configurable para limpiar eventos antiguos

### Estado

**Aprobado** - Implementado en repositories

---

## ADR-006: Retry y Circuit Breaker

### Contexto

Los sistemas distribuidos experimentan fallos transitorios. Se necesita estrategia de retry robusta sin sobrecargar el sistema.

### Decisión

**Retry con backoff exponencial + jitter + circuit breaker**.

### Detalles técnicos

- **Retry strategy**:
  - Backoff exponencial: `base * 2^attempt + jitter`
  - Máximo de intentos: 5 (configurable)
  - Jitter: 20% para evitar thundering herd
- **Circuit breaker**:
  - Umbral de errores: 50% en ventana de 10 segundos
  - Timeout: 30 segundos
  - Half-open: prueba con request único
- **Thundering herd prevention**:
  - Redis distributed lock durante retry
  - Lock timeout: 30 segundos

### Estado

**Aprobado** - Implementado en `src/infrastructure/saga/retries/`

---

## Resumen de decisiones

| ADR | Decisión | Status |
|-----|----------|--------|
| 001 | Outbox Pattern | Aprobado |
| 002 | Saga distribuida (orquestación) | Aprobado |
| 003 | Híbrido Kafka + SQS FIFO | Aprobado |
| 004 | DynamoDB + PostgreSQL para outbox | Aprobado |
| 005 | Idempotencia con ULIDs | Aprobado |
| 006 | Retry + Circuit Breaker | Aprobado |

---

*ADR generado para el sistema de procesamiento de créditos con arquitectura event-driven.*