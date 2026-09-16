# Prompt para Mejorar el Codigo Base

Copia y pega el contenido del bloque de abajo en un asistente de IA (Claude, ChatGPT)
para obtener un ZIP con el proyecto completo y arrancable.

Si preferis trabajar en tu editor con un agente local (Claude Code, Cursor, Copilot), usa `AGENTS.md` en vez de este archivo: dice lo mismo pero para que escriba los archivos en disco.

## Las dos reglas que no se negocian

1. **Completa el boilerplate.** Todo lo que el proyecto necesita para compilar y arrancar: manifiesto de dependencias, punto de entrada, configuracion, capa de interfaz, y las capas del patron arquitectonico declarado. Eso es andamiaje y es tu trabajo.
2. **NO resuelvas el reto.** Los entregables de las fases son el trabajo de la persona. El hueco pedagogico se deja como esta: el proyecto arranca, pero lo que el reto pide implementar NO esta implementado.

Dicho de otra forma: si algo impide compilar, arreglalo. Si algo es logica de negocio incompleta, validaciones ausentes, un secreto hardcodeado o un patron mejorable, dejalo exactamente como esta — es lo que la persona tiene que encontrar.

## Lo que le falta a este proyecto

Esto NO lo tenes que adivinar: salio de comparar el proyecto contra la arquitectura declarada del reto y de un analisis estatico del codigo. Completalo TODO.

### Archivos que la arquitectura del reto declara y no estan

Creálos con implementacion real, en la capa que les corresponde:

- `test/unit/infrastructure/outbox/outbox.repository.spec.ts`
- `test/unit/infrastructure/saga/saga-coordinator.service.spec.ts`
- `test/integration/infrastructure/message-brokers/kafka-integration.spec.ts`

### Referencias colgando en el codigo que si esta

Cada una rompe la compilacion:

- `src/infrastructure/outbox/dynamodb/dynamodb-outbox.repository.ts` — `OutboxMessage.map`: Se invoca `map` sobre `OutboxMessage`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.
- `src/infrastructure/outbox/dynamodb/dynamodb-outbox.repository.ts` — `OutboxMessage.filter`: Se invoca `filter` sobre `OutboxMessage`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.
- `src/infrastructure/saga/saga-coordinator.service.ts` — `SagaStep.execute`: Se invoca `execute` sobre `SagaStep`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.
- `src/infrastructure/saga/saga-coordinator.service.ts` — `SagaStep.find`: Se invoca `find` sobre `SagaStep`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.

## Como saber que terminaste

```bash
el comando de build o arranque canonico del stack elegido
```

Ese comando corriendo sin errores es la definicion de "listo".

---

```
## Briefing del reto (autoridad)
Este bloque manda sobre los archivos adjuntos. El stack y el rol salen de AQUÍ, no de un topic genérico ni de markdown placeholder.

### Contexto técnico original
Ingeniero SeniorL3 con 8+ años en backend distribuido. Stack: TypeScript, Node.js 22, Kafka, SQS FIFO, DynamoDB, PostgreSQL. Debe justificar consistencia eventual, backpressure, idempotencia, exactly-once vs at-least-once. Comparar Kafka vs SQS FIFO en al menos 4 fases del reto. Incluir manejo de compensaciones en la saga, retries con backoff exponencial + jitter, y cómo evitar thundering herd. El reto debe forzar decisiones no triviales.

### Reto
- Tema: arquitectura event-driven con outbox pattern y saga distribuida
- Seniority: senior-l3
- Tipo: practical
- Título: Diseño y justificación de una arquitectura event-driven con outbox pattern y saga distribuida
- Tiempo estimado: 15 horas

### Fases (trabajo del HUMANO — PROHIBIDO completarlas)
No implementes estos entregables. Dejalos como hueco pedagógico. El asistente solo materializa el proyecto arrancable para que el participante pueda trabajar.
- Fase 1: Exploración y modelado del dominio — objetivo: Identificar y modelar los eventos y actores clave en el dominio de la banca y el procesamiento de créditos. — entregable (NO resolver): Modelo del dominio con eventos, actores y propiedades operativas.
- Fase 2: Implementación del outbox pattern — objetivo: Implementar el outbox pattern para garantizar la consistencia eventual y la idempotencia en el procesamiento de eventos. — entregable (NO resolver): Implementación del outbox pattern con garantías de consistencia eventual y idempotencia.
- Fase 3: Comparación de Kafka vs SQS FIFO — objetivo: Comparar Kafka vs SQS FIFO en términos de exactly-once vs at-least-once y otras propiedades operativas. — entregable (NO resolver): Comparación detallada de Kafka vs SQS FIFO con recomendación fundamentada.
- Fase 4: Implementación de la saga distribuida — objetivo: Implementar una saga distribuida para manejar compensaciones y retries con backoff exponencial + jitter. — entregable (NO resolver): Implementación de la saga distribuida con manejo de compensaciones y retries.

Eres un asistente experto en análisis, corrección y generación de archivos de cualquier tipo:
código fuente, documentación, hojas de cálculo, documentos Word, configuraciones, entre otros.
Voy a enviarte una cadena de texto que contiene uno o más archivos. Cada archivo está delimitado por un marcador con el siguiente formato:
// === ARCHIVO: ruta/del/archivo.extension ===
o también puede aparecer como:
## === ARCHIVO: ruta/del/archivo.extension ===
Lo que sigue al marcador puede ser:

El contenido real del archivo (código, texto, YAML, etc.)
Una descripción en lenguaje natural de lo que debe contener el archivo


TU TAREA
PASO 0 — ¿Esto es un proyecto o una carcasa?
Antes de extraer archivos, leé el Briefing (si está) y diagnosticá el adjunto.

Es CARCASA si ocurre CUALQUIERA de estas:
- No hay manifiesto de dependencias del stack del briefing (manifest.json de VTEX IO / package.json / pom.xml / build.gradle / requirements.txt / go.mod / *.tf / *.csproj, según corresponda)
- Hay un "binario" que en realidad es un comentario ("no puede ser mostrado como texto plano", placeholder .fig/.docx vacío)
- Los markdowns ya completan entregables de fases posteriores ("se implementó fade-in", lista de áreas ya resuelta)

Si es CARCASA:
- MATERIALIZÁ un proyecto que arranca en el stack del briefing (VTEX IO Store Framework, Angular, Terraform, pytest, Nest, etc.). Incluí manifiesto, punto de entrada y capa de interfaz reales.
- NO copies los markdowns de "solución" como si fueran el producto. Son ruido de generación.
- NO resuelvas las fases del briefing (están marcadas PROHIBIDO). Dejá el hueco pedagógico: el flujo existe, las microinteracciones/calidad/infra que el reto pide NO están hechas.
- Después seguí al PASO 5 (ZIP).

Si es un proyecto REAL (manifiesto + código que compila o arranca):
- Seguí PASO 1 en adelante. 🔴 compilación sí. 🟡 pedagógico no.

PASO 1 — Detección y extracción
Identifica todos los archivos presentes en la cadena. Para cada archivo extrae:

Su ruta completa (ej: src/main/java/com/pragma/Service.java)
Su contenido o descripción

PASO 2 — Clasificación por tipo
Clasifica cada archivo en una de estas categorías:
A) Código fuente (Java, Python, TypeScript, JavaScript, Kotlin, etc.)
B) Configuración / documentación (YAML, properties, Markdown, JSON, txt, etc.)
C) Excel (.xlsx, .xls, .csv)
D) Word (.docx, .doc)
E) Otro tipo de archivo binario o especial
PASO 3 — Clasificación de errores en código fuente

Objetivo prioritario: que el proyecto compile. No corrijas flujo de negocio ni lógica funcional.

Antes de modificar cualquier archivo de código fuente, clasifica cada problema encontrado en una de estas dos categorías:
🔴 ERROR DE COMPILACIÓN — corregir siempre
Son errores que impiden que el proyecto arranque, sin valor pedagógico:

Import faltante o incorrecto
Clase, método o variable referenciada que no existe en ningún archivo del proyecto
Error de sintaxis
Anotación con atributos inválidos
Dependencia ausente en pom.xml, package.json, etc.
Archivo referenciado que no existe y debe ser creado con implementación mínima

→ CORREGIR estos errores.
🟡 PROBLEMA FUNCIONAL O DE CALIDAD — preservar siempre
Son problemas que no impiden compilar. Pueden ser intencionales para el aprendizaje:

Clave secreta hardcodeada ("secret", "password123")
API deprecada que funciona pero tiene reemplazo moderno
Lógica de negocio incorrecta o incompleta
Código redundante o de baja legibilidad
Falta de validaciones en flujo de negocio
Patrones de diseño incorrectos pero funcionales
Concurrencia no segura
Configuración funcional pero no óptima

→ PRESERVAR tal cual. No corregir, no mejorar, no comentar.
PASO 4 — Procesamiento según tipo de archivo
Tipo A — Código fuente
Aplica únicamente las correcciones clasificadas como 🔴 ERROR DE COMPILACIÓN.
No alteres ningún elemento clasificado como 🟡 PROBLEMA FUNCIONAL O DE CALIDAD.
Si falta un archivo referenciado, créalo con la implementación mínima necesaria para compilar.
Tipo B — Configuración / documentación
Extrae el contenido tal cual, sin modificaciones salvo errores evidentes de sintaxis
(ej: YAML mal indentado).
Tipo C — Excel (.xlsx)
Si viene con contenido real, genera el archivo respetando ese contenido.
Si viene con descripción en lenguaje natural, genera un archivo Excel funcional con:

Fila de encabezados en negrita con color de fondo distintivo
Columnas con ancho ajustado al contenido
Tipos de dato correctos por columna
Validaciones si la descripción lo indica
Hojas nombradas descriptivamente si hay más de una
Filas de ejemplo si no hay datos reales

Tipo D — Word (.docx)
Si viene con contenido real, genera el archivo respetando ese contenido.
Si viene con descripción en lenguaje natural, genera un documento Word funcional con:

Estilos de título (Título 1, Título 2) para jerarquía de secciones
Fuente legible (Calibri o equivalente), tamaño 11-12pt para cuerpo
Márgenes estándar
Tabla de contenido si tiene múltiples secciones
Tablas con encabezados en negrita si aplica

Tipo E — Otro
Genera el archivo con el contenido o estructura más apropiada según la descripción.
PASO 5 — Exportación en ZIP
Empaqueta todos los archivos en un único archivo ZIP descargable respetando exactamente
la estructura de rutas indicada por los marcadores.
El ZIP debe incluir:

Archivos de código con únicamente los errores de compilación corregidos
Archivos de configuración y documentación sin cambios
Archivos nuevos creados para resolver dependencias de compilación faltantes
Archivos Excel y Word generados desde descripción

IMPORTANTE: El ZIP debe estar listo para descargar al finalizar. No preguntes si el usuario
quiere generarlo. Simplemente genera el archivo y proporciona el enlace de descarga; No debes desplegar en el chat el resumen de lo que arreglaste al Zip, solo entregalo.

REGLAS IMPORTANTES

No omitas ningún archivo aunque no tenga errores ni modificaciones
Respeta los nombres y rutas exactas indicadas por los marcadores
Si un archivo no tiene marcador claro, infiere el nombre desde su contenido
Si la cadena contiene solo documentación, placeholders o binarios fake, NO la reproduzcas:
aplicá PASO 0 (materializar el proyecto del briefing). Reproducir la carcasa es un fallo.
No agregues texto después del enlace de descarga del ZIP
No preguntes si el usuario quiere el ZIP: simplemente generalo siempre
Si detectas que falta un archivo de configuración necesario para compilar
(pom.xml, package.json, requirements.txt, build.gradle, etc.), créalo e inclúyelo
inferiendo su contenido desde los imports y frameworks detectados en el código
Nunca corrijas problemas 🟡 aunque parezcan obvios o fáciles de mejorar.
El participante que recibirá este proyecto los debe encontrar y resolver él mismo.


INPUT
Aquí está la cadena con los archivos:

// === ARCHIVO: tsconfig.json ===
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@interfaces/*": ["src/interfaces/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src/**/*", "test/**/*"],
  "exclude": ["node_modules", "dist"]
}

// === ARCHIVO: package.json ===
{
  "name": "event-driven-credit-processing",
  "version": "1.0.0",
  "description": "Event-driven architecture with outbox pattern and distributed saga for credit processing",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/main.js",
    "start:dev": "ts-node src/main.ts",
    "start:prod": "node dist/main.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:unit": "jest --testPathPattern=test/unit",
    "test:integration": "jest --testPathPattern=test/integration",
    "test:e2e": "jest --testPathPattern=test/e2e",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"{src,test}/**/*.ts\""
  },
  "dependencies": {
    "@nestjs/common": "10.3.0",
    "@nestjs/core": "10.3.0",
    "@nestjs/platform-express": "10.3.0",
    "@nestjs/config": "3.1.1",
    "@aws-sdk/client-sqs": "3.504.0",
    "@aws-sdk/client-dynamodb": "3.504.0",
    "@aws-sdk/lib-dynamodb": "3.504.0",
    "kafkajs": "2.2.4",
    "pg": "8.11.3",
    "exponential-backoff": "3.2.0",
    "ioredis": "5.3.2",
    "ulid": "2.3.0",
    "reflect-metadata": "0.2.1",
    "rxjs": "7.8.1",
    "class-validator": "0.14.1",
    "class-transformer": "0.5.1"
  },
  "devDependencies": {
    "@nestjs/cli": "10.3.0",
    "@nestjs/schematics": "10.1.0",
    "@nestjs/testing": "10.3.0",
    "@types/express": "4.17.21",
    "@types/jest": "29.5.12",
    "@types/node": "20.11.0",
    "@types/pg": "8.10.9",
    "@typescript-eslint/eslint-plugin": "6.19.0",
    "@typescript-eslint/parser": "6.19.0",
    "eslint": "8.56.0",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-prettier": "5.1.3",
    "jest": "29.7.0",
    "prettier": "3.2.4",
    "sinon": "17.0.1",
    "testcontainers": "10.7.1",
    "ts-jest": "29.1.2",
    "ts-node": "10.9.2",
    "typescript": "5.5.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@domain/(.*)$": "<rootDir>/src/domain/$1",
      "^@application/(.*)$": "<rootDir>/src/application/$1",
      "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
      "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
      "^@shared/(.*)$": "<rootDir>/src/shared/$1"
    }
  },
  "engines": {
    "node": ">=22.0.0"
  }
}

// === ARCHIVO: src/main.ts ===
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;
  const environment = configService.get<string>('NODE_ENV') || 'development';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  if (environment !== 'production') {
    const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED');
    if (swaggerEnabled) {
      // Swagger setup would be configured here in production code
      // DocumentBuilder.create()... app.useSwagger()... etc.
    }
  }

  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port} in ${environment} mode`,
  );
  console.log(`Event-driven outbox pattern system initialized`);
  console.log(`Distributed saga coordinator ready`);

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();


// === ARCHIVO: src/domain/events/credit-originated.event.ts ===
import { ulid } from 'ulid';

export interface CreditOriginatedEventMetadata {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly version: string;
  readonly correlationId: string;
  readonly causationId?: string;
}

export interface CreditApplicant {
  readonly applicantId: string;
  readonly fullName: string;
  readonly email: string;
  readonly documentType: 'CPF' | 'CNPJ' | 'PASSPORT';
  readonly documentNumber: string;
  readonly monthlyIncome: number;
  readonly creditScore: number;
}

export interface CreditDetails {
  readonly creditId: string;
  readonly amount: number;
  readonly currency: string;
  readonly termMonths: number;
  readonly interestRate: number;
  readonly purpose: 'PERSONAL' | 'BUSINESS' | 'REFINANCING' | 'CONSIGNMENT';
  readonly installmentAmount: number;
  readonly firstPaymentDate: Date;
}

export interface CreditOriginatedEventData {
  readonly credit: CreditDetails;
  readonly applicant: CreditApplicant;
  readonly originators: ReadonlyArray<string>;
  readonly approvedBy: string;
  readonly channel: string;
}

export class CreditOriginatedEvent {
  readonly eventType = 'CreditOriginated' as const;
  readonly metadata: CreditOriginatedEventMetadata;
  readonly data: CreditOriginatedEventData;

  private constructor(
    metadata: CreditOriginatedEventMetadata,
    data: CreditOriginatedEventData,
  ) {
    this.metadata = metadata;
    this.data = data;
  }

  static create(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    correlationId: string,
    approvedBy: string,
    channel: string = 'DIGITAL_PLATFORM',
  ): CreditOriginatedEvent {
    const eventId = ulid();
    const occurredAt = new Date();
    const version = '1.0.0';

    const metadata: CreditOriginatedEventMetadata = {
      eventId,
      occurredAt,
      version,
      correlationId,
      causationId: undefined,
    };

    const data: CreditOriginatedEventData = {
      credit: creditDetails,
      applicant,
      originators: ['CREDIT_ORIGINATION_SYSTEM'],
      approvedBy,
      channel,
    };

    return new CreditOriginatedEvent(metadata, data);
  }

  static fromPayload(payload: {
    metadata: CreditOriginatedEventMetadata;
    data: CreditOriginatedEventData;
  }): CreditOriginatedEvent {
    return new CreditOriginatedEvent(payload.metadata, payload.data);
  }

  getEventId(): string {
    return this.metadata.eventId;
  }

  getCreditId(): string {
    return this.data.credit.creditId;
  }

  getCorrelationId(): string {
    return this.metadata.correlationId;
  }

  getOccurredAt(): Date {
    return this.metadata.occurredAt;
  }

  getApplicantId(): string {
    return this.data.applicant.applicantId;
  }

  getAmount(): number {
    return this.data.credit.amount;
  }

  getPurpose(): string {
    return this.data.credit.purpose;
  }

  isHighValue(): boolean {
    return this.data.credit.amount >= 100000;
  }

  isHighRiskApplicant(): boolean {
    return this.data.applicant.creditScore < 600;
  }

  toPlainObject(): {
    eventType: string;
    metadata: CreditOriginatedEventMetadata;
    data: CreditOriginatedEventData;
  } {
    return {
      eventType: this.eventType,
      metadata: {
        ...this.metadata,
        occurredAt: this.metadata.occurredAt,
      },
      data: this.data,
    };
  }
}

// === ARCHIVO: src/domain/events/fraud-checked.event.ts ===
import { ulid } from 'ulid';

export enum FraudRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  BLOCKED = 'BLOCKED',
}

export enum FraudCheckStatus {
  APPROVED = 'APPROVED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export interface FraudCheckResult {
  readonly status: FraudCheckStatus;
  readonly riskLevel: FraudRiskLevel;
  readonly fraudScore: number;
  readonly checksPerformed: ReadonlyArray<string>;
  readonly flags: ReadonlyArray<string>;
  readonly recommendation: 'APPROVE' | 'REVIEW' | 'REJECT';
}

export interface FraudCheckBreakdown {
  readonly identityVerification: boolean;
  readonly addressVerification: boolean;
  readonly incomeVerification: boolean;
  readonly creditBureauCheck: boolean;
  readonly velocityCheck: boolean;
  readonly deviceFingerprintCheck: boolean;
  readonly biometricVerification: boolean;
}

export interface FraudCheckedEventMetadata {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly version: string;
  readonly correlationId: string;
  readonly causationId: string;
}

export interface FraudCheckedEventData {
  readonly creditId: string;
  readonly applicantId: string;
  readonly fraudCheckId: string;
  readonly result: FraudCheckResult;
  readonly breakdown: FraudCheckBreakdown;
  readonly checkedBy: string;
  readonly processingTimeMs: number;
}

export class FraudCheckedEvent {
  readonly eventType = 'FraudChecked' as const;
  readonly metadata: FraudCheckedEventMetadata;
  readonly data: FraudCheckedEventData;

  private constructor(
    metadata: FraudCheckedEventMetadata,
    data: FraudCheckedEventData,
  ) {
    this.metadata = metadata;
    this.data = data;
  }

  static create(
    creditId: string,
    applicantId: string,
    fraudCheckResult: FraudCheckResult,
    breakdown: FraudCheckBreakdown,
    correlationId: string,
    checkedBy: string,
    processingTimeMs: number,
  ): FraudCheckedEvent {
    const eventId = ulid();
    const fraudCheckId = ulid();
    const occurredAt = new Date();
    const version = '1.0.0';

    const metadata: FraudCheckedEventMetadata = {
      eventId,
      occurredAt,
      version,
      correlationId,
      causationId: correlationId,
    };

    const data: FraudCheckedEventData = {
      creditId,
      applicantId,
      fraudCheckId,
      result: fraudCheckResult,
      breakdown,
      checkedBy,
      processingTimeMs,
    };

    return new FraudCheckedEvent(metadata, data);
  }

  static fromPayload(payload: {
    metadata: FraudCheckedEventMetadata;
    data: FraudCheckedEventData;
  }): FraudCheckedEvent {
    return new FraudCheckedEvent(payload.metadata, payload.data);
  }

  getEventId(): string {
    return this.metadata.eventId;
  }

  getCreditId(): string {
    return this.data.creditId;
  }

  getCorrelationId(): string {
    return this.metadata.correlationId;
  }

  getOccurredAt(): Date {
    return this.metadata.occurredAt;
  }

  getRiskLevel(): FraudRiskLevel {
    return this.data.result.riskLevel;
  }

  getStatus(): FraudCheckStatus {
    return this.data.result.status;
  }

  getFraudScore(): number {
    return this.data.result.fraudScore;
  }

  isApproved(): boolean {
    return this.data.result.status === FraudCheckStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.data.result.status === FraudCheckStatus.REJECTED;
  }

  requiresManualReview(): boolean {
    return this.data.result.status === FraudCheckStatus.REVIEW_REQUIRED;
  }

  isHighRisk(): boolean {
    return (
      this.data.result.riskLevel === FraudRiskLevel.HIGH ||
      this.data.result.riskLevel === FraudRiskLevel.CRITICAL ||
      this.data.result.riskLevel === FraudRiskLevel.BLOCKED
    );
  }

  getRecommendation(): string {
    return this.data.result.recommendation;
  }

  getChecksPerformed(): ReadonlyArray<string> {
    return this.data.result.checksPerformed;
  }

  toPlainObject(): {
    eventType: string;
    metadata: FraudCheckedEventMetadata;
    data: FraudCheckedEventData;
  } {
    return {
      eventType: this.eventType,
      metadata: {
        ...this.metadata,
        occurredAt: this.metadata.occurredAt,
      },
      data: this.data,
    };
  }
}

// === ARCHIVO: src/domain/actors/credit-originator.ts ===
import { CreditOriginatedEvent, CreditOriginatedEventData } from '../events/credit-originated.event';
import { CreditDetails, CreditApplicant } from '../events/credit-originated.event';

export enum OriginatorStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum OriginatorType {
  RETAIL = 'RETAIL',
  CORPORATE = 'CORATE',
  MICROFINANCE = 'MICROFINANCE',
  CONSIGNMENT = 'CONSIGNMENT',
}

export interface OriginatorConfiguration {
  readonly maxSingleCreditAmount: number;
  readonly maxMonthlyCreditVolume: number;
  readonly allowedCreditPurposes: ReadonlyArray<string>;
  readonly requiresManualApproval: boolean;
  readonly approvalThreshold: number;
}

export interface OriginatorMetrics {
  readonly totalCreditsOriginated: number;
  readonly totalVolumeProcessed: number;
  readonly averageCreditScore: number;
  readonly approvalRate: number;
  readonly lastActivityAt: Date;
}

export class CreditOriginator {
  readonly originatorId: string;
  readonly name: string;
  readonly type: OriginatorType;
  readonly status: OriginatorStatus;
  readonly configuration: OriginatorConfiguration;
  private metrics: OriginatorMetrics;

  private constructor(
    originatorId: string,
    name: string,
    type: OriginatorType,
    status: OriginatorStatus,
    configuration: OriginatorConfiguration,
    metrics: OriginatorMetrics,
  ) {
    this.originatorId = originatorId;
    this.name = name;
    this.type = type;
    this.status = status;
    this.configuration = configuration;
    this.metrics = metrics;
  }

  static create(
    originatorId: string,
    name: string,
    type: OriginatorType,
    configuration: OriginatorConfiguration,
  ): CreditOriginator {
    const initialMetrics: OriginatorMetrics = {
      totalCreditsOriginated: 0,
      totalVolumeProcessed: 0,
      averageCreditScore: 0,
      approvalRate: 0,
      lastActivityAt: new Date(),
    };

    return new CreditOriginator(
      originatorId,
      name,
      type,
      OriginatorStatus.ACTIVE,
      configuration,
      initialMetrics,
    );
  }

  canOriginateCredit(creditDetails: CreditDetails, applicant: CreditApplicant): boolean {
    if (this.status !== OriginatorStatus.ACTIVE) {
      return false;
    }

    if (creditDetails.amount > this.configuration.maxSingleCreditAmount) {
      return false;
    }

    if (!this.configuration.allowedCreditPurposes.includes(creditDetails.purpose)) {
      return false;
    }

    if (
      this.configuration.requiresManualApproval &&
      creditDetails.amount >= this.configuration.approvalThreshold
    ) {
      return false;
    }

    return true;
  }

  createCreditOriginatedEvent(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    correlationId: string,
    approvedBy: string,
    channel: string,
  ): CreditOriginatedEvent {
    if (!this.canOriginateCredit(creditDetails, applicant)) {
      throw new Error(
        `CreditOriginator ${this.originatorId} cannot originate credit ${creditDetails.creditId}`,
      );
    }

    return CreditOriginatedEvent.create(
      creditDetails,
      applicant,
      correlationId,
      approvedBy,
      channel,
    );
  }

  updateMetrics(eventData: CreditOriginatedEventData): void {
    const newTotalCredits = this.metrics.totalCreditsOriginated + 1;
    const newTotalVolume = this.metrics.totalVolumeProcessed + eventData.credit.amount;
    const newAverageScore =
      (this.metrics.averageCreditScore * this.metrics.totalCreditsOriginated +
        eventData.applicant.creditScore) /
      newTotalCredits;

    this.metrics = {
      totalCreditsOriginated: newTotalCredits,
      totalVolumeProcessed: newTotalVolume,
      averageCreditScore: Math.round(newAverageScore),
      approvalRate: this.calculateApprovalRate(),
      lastActivityAt: new Date(),
    };
  }

  private calculateApprovalRate(): number {
    if (this.metrics.totalCreditsOriginated === 0) {
      return 0;
    }
    return (this.metrics.totalCreditsOriginated / (this.metrics.totalCreditsOriginated + 1)) * 100;
  }

  getMetrics(): Readonly<OriginatorMetrics> {
    return { ...this.metrics };
  }

  suspend(): void {
    if (this.status === OriginatorStatus.ACTIVE) {
      this.status = OriginatorStatus.SUSPENDED;
    }
  }

  activate(): void {
    if (this.status === OriginatorStatus.SUSPENDED || this.status === OriginatorStatus.INACTIVE) {
      this.status = OriginatorStatus.ACTIVE;
    }
  }

  deactivate(): void {
    this.status = OriginatorStatus.INACTIVE;
  }

  isActive(): boolean {
    return this.status === OriginatorStatus.ACTIVE;
  }

  isWithinVolumeLimit(currentMonthVolume: number, proposedAmount: number): boolean {
    return currentMonthVolume + proposedAmount <= this.configuration.maxMonthlyCreditVolume;
  }

  getOriginatorId(): string {
    return this.originatorId;
  }

  getName(): string {
    return this.name;
  }

  getType(): OriginatorType {
    return this.type;
  }

  getStatus(): OriginatorStatus {
    return this.status;
  }

  toPlainObject(): {
    originatorId: string;
    name: string;
    type: OriginatorType;
    status: OriginatorStatus;
    configuration: OriginatorConfiguration;
    metrics: OriginatorMetrics;
  } {
    return {
      originatorId: this.originatorId,
      name: this.name,
      type: this.type,
      status: this.status,
      configuration: this.configuration,
      metrics: { ...this.metrics },
    };
  }
}


// === ARCHIVO: src/domain/actors/fraud-engine.ts ===
import { FraudCheckedEvent, FraudCheckResult, FraudRiskLevel, FraudCheckStatus, FraudCheckedEventData, FraudCheckedEventMetadata, FraudCheckBreakdown } from '../events/fraud-checked.event';
import { CreditDetails, CreditApplicant } from '../events/credit-originated.event';
import { ulid } from 'ulid';

export enum FraudEngineStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DEGRADED = 'DEGRADED',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface FraudEngineConfiguration {
  readonly maxConcurrentChecks: number;
  readonly checkTimeoutMs: number;
  readonly enableBreakdown: boolean;
  readonly riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  readonly enabledChecks: readonly string[];
}

export interface FraudEngineMetrics {
  readonly totalChecksPerformed: number;
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly reviewCount: number;
  readonly averageProcessingTimeMs: number;
  readonly lastCheckAt?: Date;
}

export class FraudEngine {
  private readonly engineId: string;
  private status: FraudEngineStatus;
  private configuration: FraudEngineConfiguration;
  private metrics: FraudEngineMetrics;
  private activeChecks: Map<string, { creditId: string; startedAt: Date }>;

  private constructor(
    engineId: string,
    configuration: FraudEngineConfiguration
  ) {
    this.engineId = engineId;
    this.status = FraudEngineStatus.IDLE;
    this.configuration = configuration;
    this.metrics = {
      totalChecksPerformed: 0,
      approvedCount: 0,
      rejectedCount: 0,
      reviewCount: 0,
      averageProcessingTimeMs: 0
    };
    this.activeChecks = new Map();
  }

  static create(configuration: FraudEngineConfiguration): FraudEngine {
    const engineId = `fraud-engine-${ulid()}`;
    return new FraudEngine(engineId, configuration);
  }

  async performFraudCheck(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    correlationId: string
  ): Promise<FraudCheckedEvent> {
    if (this.activeChecks.size >= this.configuration.maxConcurrentChecks) {
      throw new Error(`Fraud engine at capacity: ${this.activeChecks.size}/${this.configuration.maxConcurrentChecks}`);
    }

    this.status = FraudEngineStatus.PROCESSING;
    const checkId = `check-${ulid()}`;
    const startedAt = new Date();
    this.activeChecks.set(checkId, { creditId: creditDetails.creditId, startedAt });

    try {
      const result = await this.executeFraudChecks(creditDetails, applicant);
      const breakdown = this.configuration.enableBreakdown 
        ? this.generateBreakdown(result) 
        : this.getDefaultBreakdown();
      
      const eventData = this.buildEventData(creditDetails, applicant, result, breakdown);
      const metadata = this.buildMetadata(correlationId, checkId);
      
      this.updateMetrics(result, startedAt);
      this.activeChecks.delete(checkId);
      
      return FraudCheckedEvent.create(metadata, eventData);
    } catch (error) {
      this.activeChecks.delete(checkId);
      this.status = FraudEngineStatus.DEGRADED;
      throw error;
    }
  }

  private async executeFraudChecks(
    creditDetails: CreditDetails,
    applicant: CreditApplicant
  ): Promise<FraudCheckResult> {
    const checksPerformed: string[] = [];
    const flags: string[] = [];
    let fraudScore = 0;

    for (const check of this.configuration.enabledChecks) {
      checksPerformed.push(check);
      const checkResult = await this.runIndividualCheck(check, creditDetails, applicant);
      fraudScore += checkResult.score;
      if (checkResult.flag) {
        flags.push(checkResult.flag);
      }
    }

    const riskLevel = this.calculateRiskLevel(fraudScore);
    const status = this.determineStatus(riskLevel, flags);
    const recommendation = this.getRecommendation(riskLevel, flags);

    return {
      status,
      riskLevel,
      fraudScore,
      checksPerformed: Object.freeze([...checksPerformed]),
      flags: Object.freeze([...flags]),
      recommendation
    };
  }

  private async runIndividualCheck(
    checkName: string,
    creditDetails: CreditDetails,
    applicant: CreditApplicant
  ): Promise<{ score: number; flag?: string }> {
    switch (checkName) {
      case 'identity_verification':
        return this.checkIdentity(applicant);
      case 'address_verification':
        return this.checkAddress(applicant);
      case 'income_verification':
        return this.checkIncome(applicant, creditDetails);
      case 'credit_bureau_check':
        return this.checkCreditBureau(applicant);
      case 'velocity_check':
        return this.checkVelocity(applicant, creditDetails);
      case 'device_fingerprint_check':
        return this.checkDeviceFingerprint(applicant);
      case 'biometric_verification':
        return this.checkBiometric(applicant);
      default:
        return { score: 0 };
    }
  }

  private checkIdentity(applicant: CreditApplicant): { score: number; flag?: string } {
    const hasValidDocument = applicant.documentNumber && applicant.documentType;
    const hasValidName = applicant.fullName && applicant.fullName.split(' ').length >= 2;
    
    if (!hasValidDocument) return { score: 30, flag: 'INVALID_DOCUMENT' };
    if (!hasValidName) return { score: 20, flag: 'INVALID_NAME' };
    if (applicant.creditScore < 300) return { score: 25, flag: 'LOW_CREDIT_SCORE' };
    
    return { score: 0 };
  }

  private checkAddress(applicant: CreditApplicant): { score: number; flag?: string } {
    return { score: 5 };
  }

  private checkIncome(applicant: CreditApplicant, creditDetails: CreditDetails): { score: number; flag?: string } {
    const installmentToIncomeRatio = creditDetails.installmentAmount / applicant.monthlyIncome;
    
    if (installmentToIncomeRatio > 0.35) {
      return { score: 25, flag: 'HIGH_DEBT_TO_INCOME' };
    }
    if (installmentToIncomeRatio > 0.25) {
      return { score: 10 };
    }
    
    return { score: 0 };
  }

  private checkCreditBureau(applicant: CreditApplicant): { score: number; flag?: string } {
    if (applicant.creditScore < 400) return { score: 35, flag: 'POOR_CREDIT_HISTORY' };
    if (applicant.creditScore < 600) return { score: 15 };
    
    return { score: 0 };
  }

  private checkVelocity(applicant: CreditApplicant, creditDetails: CreditDetails): { score: number; flag?: string } {
    if (creditDetails.amount > 50000) return { score: 15, flag: 'HIGH_VALUE_REQUEST' };
    
    return { score: 0 };
  }

  private checkDeviceFingerprint(applicant: CreditApplicant): { score: number; flag?: string } {
    return { score: 5 };
  }

  private checkBiometric(applicant: CreditApplicant): { score: number; flag?: string } {
    return { score: 5 };
  }

  private calculateRiskLevel(score: number): FraudRiskLevel {
    const { riskThresholds } = this.configuration;
    
    if (score >= riskThresholds.critical) return FraudRiskLevel.CRITICAL;
    if (score >= riskThresholds.high) return FraudRiskLevel.HIGH;
    if (score >= riskThresholds.medium) return FraudRiskLevel.MEDIUM;
    if (score >= riskThresholds.low) return FraudRiskLevel.LOW;
    
    return FraudRiskLevel.MINIMAL;
  }

  private determineStatus(riskLevel: FraudRiskLevel, flags: string[]): FraudCheckStatus {
    if (flags.length >= 3) return FraudCheckStatus.FAILED;
    if (riskLevel === FraudRiskLevel.CRITICAL) return FraudCheckStatus.FAILED;
    if (riskLevel === FraudRiskLevel.HIGH) return FraudCheckStatus.REVIEW;
    
    return FraudCheckStatus.PASSED;
  }

  private getRecommendation(riskLevel: FraudRiskLevel, flags: string[]): 'APPROVE' | 'REVIEW' | 'REJECT' {
    if (riskLevel === FraudRiskLevel.CRITICAL || flags.includes('INVALID_DOCUMENT')) {
      return 'REJECT';
    }
    if (riskLevel === FraudRiskLevel.HIGH || flags.length >= 2) {
      return 'REVIEW';
    }
    
    return 'APPROVE';
  }

  private generateBreakdown(result: FraudCheckResult): FraudCheckBreakdown {
    const checks = result.checksPerformed;
    
    return {
      identityVerification: checks.includes('identity_verification'),
      addressVerification: checks.includes('address_verification'),
      incomeVerification: checks.includes('income_verification'),
      creditBureauCheck: checks.includes('credit_bureau_check'),
      velocityCheck: checks.includes('velocity_check'),
      deviceFingerprintCheck: checks.includes('device_fingerprint_check'),
      biometricVerification: checks.includes('biometric_verification')
    };
  }

  private getDefaultBreakdown(): FraudCheckBreakdown {
    return {
      identityVerification: false,
      addressVerification: false,
      incomeVerification: false,
      creditBureauCheck: false,
      velocityCheck: false,
      deviceFingerprintCheck: false,
      biometricVerification: false
    };
  }

  private buildMetadata(correlationId: string, checkId: string): FraudCheckedEventMetadata {
    return {
      eventId: `evt-${ulid()}`,
      occurredAt: new Date(),
      version: '1.0.0',
      correlationId,
      causationId: checkId
    };
  }

  private buildEventData(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    result: FraudCheckResult,
    breakdown: FraudCheckBreakdown
  ): FraudCheckedEventData {
    return {
      creditId: creditDetails.creditId,
      applicantId: applicant.applicantId,
      fraudCheckId: `check-${ulid()}`,
      result,
      breakdown,
      checkedBy: this.engineId,
      processingTimeMs: 0
    };
  }

  private updateMetrics(result: FraudCheckResult, startedAt: Date): void {
    const processingTime = Date.now() - startedAt.getTime();
    const totalChecks = this.metrics.totalChecksPerformed + 1;
    
    this.metrics = {
      totalChecksPerformed: totalChecks,
      approvedCount: this.metrics.approvedCount + (result.recommendation === 'APPROVE' ? 1 : 0),
      rejectedCount: this.metrics.rejectedCount + (result.recommendation === 'REJECT' ? 1 : 0),
      reviewCount: this.metrics.reviewCount + (result.recommendation === 'REVIEW' ? 1 : 0),
      averageProcessingTimeMs: ((this.metrics.averageProcessingTimeMs * this.metrics.totalChecksPerformed) + processingTime) / totalChecks,
      lastCheckAt: new Date()
    };
  }

  getEngineId(): string {
    return this.engineId;
  }

  getStatus(): FraudEngineStatus {
    return this.status;
  }

  getMetrics(): Readonly<FraudEngineMetrics> {
    return { ...this.metrics };
  }

  getConfiguration(): Readonly<FraudEngineConfiguration> {
    return { ...this.configuration };
  }

  getActiveCheckCount(): number {
    return this.activeChecks.size;
  }

  isAvailable(): boolean {
    return this.status === FraudEngineStatus.IDLE && 
           this.activeChecks.size < this.configuration.maxConcurrentChecks;
  }

  setStatus(status: FraudEngineStatus): void {
    this.status = status;
  }

  suspend(): void {
    this.status = FraudEngineStatus.UNAVAILABLE;
  }

  resume(): void {
    this.status = FraudEngineStatus.IDLE;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      engineId: this.engineId,
      status: this.status,
      configuration: this.configuration,
      metrics: this.metrics,
      activeCheckCount: this.activeChecks.size
    };
  }
}

// === ARCHIVO: src/domain/models/outbox-message.model.ts ===
export enum OutboxMessageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  DUPLICATE = 'DUPLICATE'
}

export enum OutboxMessageType {
  CREDIT_ORIGINATED = 'CREDIT_ORIGINATED',
  FRAUD_CHECKED = 'FRAUD_CHECKED',
  CREDIT_APPROVED = 'CREDIT_APPROVED',
  CREDIT_REJECTED = 'CREDIT_REJECTED',
  COMPENSATION = 'COMPENSATION'
}

export interface OutboxMessagePayload {
  readonly eventType: string;
  readonly eventId: string;
  readonly data: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
}

export interface OutboxMessage {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly type: OutboxMessageType;
  readonly payload: OutboxMessagePayload;
  readonly status: OutboxMessageStatus;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly createdAt: Date;
  readonly processedAt?: Date;
  readonly publishedAt?: Date;
  readonly lastError?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly version: number;
}

export interface OutboxMessageCreateInput {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly type: OutboxMessageType;
  readonly payload: OutboxMessagePayload;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly maxAttempts?: number;
}

export interface OutboxMessageUpdateInput {
  readonly status?: OutboxMessageStatus;
  readonly attempts?: number;
  readonly lastError?: string;
  readonly processedAt?: Date;
  readonly publishedAt?: Date;
}

export interface OutboxMessageFilter {
  readonly status?: OutboxMessageStatus;
  readonly type?: OutboxMessageType;
  readonly aggregateId?: string;
  readonly correlationId?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  readonly limit?: number;
  readonly offset?: number;
}

export class OutboxMessageEntity implements OutboxMessage {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly type: OutboxMessageType;
  readonly payload: OutboxMessagePayload;
  private _status: OutboxMessageStatus;
  private _attempts: number;
  readonly maxAttempts: number;
  readonly createdAt: Date;
  private _processedAt?: Date;
  private _publishedAt?: Date;
  private _lastError?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly version: number;

  private constructor(
    id: string,
    aggregateId: string,
    aggregateType: string,
    type: OutboxMessageType,
    payload: OutboxMessagePayload,
    status: OutboxMessageStatus,
    attempts: number,
    maxAttempts: number,
    createdAt: Date,
    correlationId: string,
    causationId: string | undefined,
    version: number
  ) {
    this.id = id;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.type = type;
    this.payload = payload;
    this._status = status;
    this._attempts = attempts;
    this.maxAttempts = maxAttempts;
    this.createdAt = createdAt;
    this.correlationId = correlationId;
    this.causationId = causationId;
    this.version = version;
  }

  static create(input: OutboxMessageCreateInput): OutboxMessageEntity {
    const { ulid } = require('ulid');
    const now = new Date();
    
    return new OutboxMessageEntity(
      `msg-${ulid()}`,
      input.aggregateId,
      input.aggregateType,
      input.type,
      input.payload,
      OutboxMessageStatus.PENDING,
      0,
      input.maxAttempts ?? 5,
      now,
      input.correlationId,
      input.causationId,
      1
    );
  }

  static fromPersistence(
    data: Record<string, unknown>
  ): OutboxMessageEntity {
    const entity = new OutboxMessageEntity(
      data.id as string,
      data.aggregateId as string,
      data.aggregateType as string,
      data.type as OutboxMessageType,
      data.payload as OutboxMessagePayload,
      data.status as OutboxMessageStatus,
      data.attempts as number,
      data.maxAttempts as number,
      new Date(data.createdAt as string),
      data.correlationId as string,
      data.causationId as string | undefined,
      data.version as number
    );
    
    entity._processedAt = data.processedAt ? new Date(data.processedAt as string) : undefined;
    entity._publishedAt = data.publishedAt ? new Date(data.publishedAt as string) : undefined;
    entity._lastError = data.lastError as string | undefined;
    
    return entity;
  }

  get status(): OutboxMessageStatus {
    return this._status;
  }

  get attempts(): number {
    return this._attempts;
  }

  get processedAt(): Date | undefined {
    return this._processedAt;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get lastError(): string | undefined {
    return this._lastError;
  }

  markAsProcessing(): void {
    this._status = OutboxMessageStatus.PROCESSING;
  }

  markAsPublished(): void {
    this._status = OutboxMessageStatus.PUBLISHED;
    this._publishedAt = new Date();
    this._processedAt = new Date();
  }

  markAsFailed(error: string): void {
    this._status = OutboxMessageStatus.FAILED;
    this._lastError = error;
    this._attempts += 1;
    
    if (this._attempts >= this.maxAttempts) {
      this._processedAt = new Date();
    }
  }

  markAsDuplicate(): void {
    this._status = OutboxMessageStatus.DUPLICATE;
    this._processedAt = new Date();
  }

  canRetry(): boolean {
    return this._status === OutboxMessageStatus.FAILED && 
           this._attempts < this.maxAttempts;
  }

  isTerminal(): boolean {
    return this._status === OutboxMessageStatus.PUBLISHED ||
           this._status === OutboxMessageStatus.DUPLICATE ||
           (this._status === OutboxMessageStatus.FAILED && this._attempts >= this.maxAttempts);
  }

  shouldBeDeleted(): boolean {
    return this.isTerminal() && this.wasPublishedMoreThanDaysAgo(30);
  }

  private wasPublishedMoreThanDaysAgo(days: number): boolean {
    if (!this._publishedAt) return false;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return this._publishedAt < threshold;
  }

  incrementAttempt(): void {
    this._attempts += 1;
  }

  getRetryDelay(): number {
    const baseDelay = 1000;
    const maxDelay = 60000;
    const delay = Math.min(baseDelay * Math.pow(2, this._attempts), maxDelay);
    const jitter = Math.random() * 0.3 * delay;
    return Math.floor(delay + jitter);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      type: this.type,
      payload: this.payload,
      status: this._status,
      attempts: this._attempts,
      maxAttempts: this.maxAttempts,
      createdAt: this.createdAt.toISOString(),
      processedAt: this._processedAt?.toISOString(),
      publishedAt: this._publishedAt?.toISOString(),
      lastError: this._lastError,
      correlationId: this.correlationId,
      causationId: this.causationId,
      version: this.version
    };
  }

  toDynamoDBItem(): Record<string, unknown> {
    return {
      id: this.id,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      type: this.type,
      payload: JSON.stringify(this.payload),
      status: this._status,
      attempts: this._attempts,
      maxAttempts: this.maxAttempts,
      createdAt: this.createdAt.toISOString(),
      processedAt: this._processedAt?.toISOString(),
      publishedAt: this._publishedAt?.toISOString(),
      lastError: this._lastError,
      correlationId: this.correlationId,
      causationId: this.causationId,
      version: this.version,
      gsi1pk: `MSG#${this._status}`,
      gsi1sk: this.createdAt.getTime().toString()
    };
  }

  static fromDynamoDBItem(item: Record<string, unknown>): OutboxMessageEntity {
    return OutboxMessageEntity.fromPersistence({
      ...item,
      payload: typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload
    });
  }

  toPostgresRow(): Record<string, unknown> {
    return {
      id: this.id,
      aggregate_id: this.aggregateId,
      aggregate_type: this.aggregateType,
      type: this.type,
      payload: JSON.stringify(this.payload),
      status: this._status,
      attempts: this._attempts,
      max_attempts: this.maxAttempts,
      created_at: this.createdAt,
      processed_at: this._processedAt,
      published_at: this._publishedAt,
      last_error: this._lastError,
      correlation_id: this.correlationId,
      causation_id: this.causationId,
      version: this.version
    };
  }

  static fromPostgresRow(row: Record<string, unknown>): OutboxMessageEntity {
    return OutboxMessageEntity.fromPersistence({
      id: row.id,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      type: row.type,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      status: row.status,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      createdAt: row.created_at,
      processedAt: row.processed_at,
      publishedAt: row.published_at,
      lastError: row.last_error,
      correlationId: row.correlation_id,
      causationId: row.causation_id,
      version: row.version
    });
  }

  equals(other: OutboxMessageEntity): boolean {
    return this.id === other.id && this.version === other.version;
  }

  getPartitionKey(): string {
    return `MSG#${this.aggregateId}`;
  }

  getSortKey(): string {
    return `${this.createdAt.getTime()}#${this.id}`;
  }
}

export function createOutboxMessageFromEvent(
  eventType: OutboxMessageType,
  eventId: string,
  aggregateId: string,
  aggregateType: string,
  eventData: Record<string, unknown>,
  metadata: Record<string, unknown>,
  correlationId: string,
  causationId?: string
): OutboxMessageEntity {
  return OutboxMessageEntity.create({
    aggregateId,
    aggregateType,
    type: eventType,
    payload: {
      eventType: eventType,
      eventId,
      data: eventData,
      metadata
    },
    correlationId,
    causationId
  });
}


// === ARCHIVO: src/infrastructure/outbox/outbox.repository.ts ===
import { Injectable } from '@nestjs/common';
import { OutboxMessage } from '@domain/models/outbox-message.model';

export interface OutboxMessageFilter {
  readonly status?: 'pending' | 'processed' | 'failed';
  readonly eventType?: string;
  readonly fromDate?: Date;
  readonly toDate?: Date;
  readonly limit?: number;
}

export interface OutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  saveBatch(messages: OutboxMessage[]): Promise<void>;
  findPending(limit: number): Promise<OutboxMessage[]>;
  findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]>;
  markAsProcessed(messageId: string, processedAt: Date): Promise<void>;
  markAsFailed(messageId: string, error: string): Promise<void>;
  existsByEventId(eventId: string): Promise<boolean>;
  updateRetryCount(messageId: string): Promise<void>;
  deleteOldProcessedMessages(olderThan: Date): Promise<number>;
}

@Injectable()
export abstract class OutboxRepositoryBase implements OutboxRepository {
  abstract save(message: OutboxMessage): Promise<void>;
  abstract saveBatch(messages: OutboxMessage[]): Promise<void>;
  abstract findPending(limit: number): Promise<OutboxMessage[]>;
  abstract findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]>;
  abstract markAsProcessed(messageId: string, processedAt: Date): Promise<void>;
  abstract markAsFailed(messageId: string, error: string): Promise<void>;
  abstract existsByEventId(eventId: string): Promise<boolean>;
  abstract updateRetryCount(messageId: string): Promise<void>;
  abstract deleteOldProcessedMessages(olderThan: Date): Promise<number>;

  protected validateMessage(message: OutboxMessage): void {
    if (!message.messageId) {
      throw new Error('OutboxMessage debe tener messageId');
    }
    if (!message.eventId) {
      throw new Error('OutboxMessage debe tener eventId');
    }
    if (!message.eventType) {
      throw new Error('OutboxMessage debe tener eventType');
    }
    if (!message.payload) {
      throw new Error('OutboxMessage debe tener payload');
    }
  }
}
// === ARCHIVO: src/infrastructure/outbox/dynamodb/dynamodb-outbox.repository.ts ===
import { Injectable, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { OutboxMessage } from '@domain/models/outbox-message.model';
import {
  OutboxRepository,
  OutboxMessageFilter,
} from '../outbox.repository';
import { ulid } from 'ulid';

const OUTBOX_TABLE = process.env.DYNAMODB_OUTBOX_TABLE || 'credit-outbox';
const OUTBOX_PARTITION_KEY = 'pk';
const OUTBOX_SORT_KEY = 'sk';
const OUTBOX_GSI1 = 'GSI1';

export interface DynamoDBOutboxConfig {
  readonly tableName: string;
  readonly gsi1Name: string;
  readonly maxRetries: number;
}

@Injectable()
export class DynamoDbOutboxRepository implements OutboxRepository {
  private readonly logger = new Logger(DynamoDbOutboxRepository.name);
  private readonly client: DynamoDBClient;
  private readonly config: DynamoDBOutboxConfig;

  constructor(client: DynamoDBClient, config?: Partial<DynamoDBOutboxConfig>) {
    this.client = client;
    this.config = {
      tableName: config?.tableName || OUTBOX_TABLE,
      gsi1Name: config?.gsi1Name || OUTBOX_GSI1,
      maxRetries: config?.maxRetries || 5,
    };
  }

  async save(message: OutboxMessage): Promise<void> {
    const exists = await this.existsByEventId(message.eventId);
    if (exists) {
      this.logger.warn(
        `Mensaje con eventId ${message.eventId} ya existe, evitando duplicado`,
      );
      return;
    }

    const item = this.toDynamoDBItem(message);
    const command = new PutCommand({
      TableName: this.config.tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk)',
    });

    try {
      await this.client.send(command);
      this.logger.debug(`Mensaje guardado en outbox: ${message.messageId}`);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        this.logger.warn(
          `Duplicado detectado para eventId: ${message.eventId}, saltando`,
        );
        return;
      }
      throw error;
    }
  }

  async saveBatch(messages: OutboxMessage[]): Promise<void> {
    const putRequests = messages.map((msg) => ({
      PutRequest: {
        Item: this.toDynamoDBItem(msg),
      },
    }));

    const batchSize = 25;
    for (let i = 0; i < putRequests.length; i += batchSize) {
      const batch = putRequests.slice(i, i + batchSize);
      this.logger.debug(
        `Procesando batch de ${batch.length} mensajes outbox`,
      );
    }
  }

  async findPending(limit: number): Promise<OutboxMessage[]> {
    const command = new QueryCommand({
      TableName: this.config.tableName,
      IndexName: this.config.gsi1Name,
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'pending',
      },
      Limit: limit,
      ScanIndexForward: true,
    });

    const response = await this.client.send(command);
    const items = response.Items || [];
    return items.map((item) => this.fromDynamoDBItem(item as Record<string, unknown>));
  }

  async findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]> {
    let keyCondition = '';
    const expressionValues: Record<string, unknown> = {};
    const expressionNames: Record<string, string> = {};

    if (filter.status) {
      keyCondition += '#status = :status';
      expressionValues[':status'] = filter.status;
      expressionNames['#status'] = 'status';
    }

    if (filter.eventType) {
      keyCondition += ' AND #eventType = :eventType';
      expressionValues[':eventType'] = filter.eventType;
      expressionNames['#eventType'] = 'eventType';
    }

    const command = keyCondition
      ? new QueryCommand({
          TableName: this.config.tableName,
          IndexName: this.config.gsi1Name,
          KeyConditionExpression: keyCondition,
          ExpressionAttributeNames: expressionNames,
          ExpressionAttributeValues: expressionValues,
          Limit: filter.limit || 100,
        })
      : new ScanCommand({
          TableName: this.config.tableName,
          Limit: filter.limit || 100,
        });

    const response = await this.client.send(command);
    const items = response.Items || [];
    let messages = items.map(
      (item) => this.fromDynamoDBItem(item as Record<string, unknown>),
    );

    if (filter.fromDate) {
      messages = messages.filter((m) => m.createdAt >= filter.fromDate!);
    }
    if (filter.toDate) {
      messages = messages.filter((m) => m.createdAt <= filter.toDate!);
    }

    return messages;
  }

  async markAsProcessed(messageId: string, processedAt: Date): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.config.tableName,
      Key: {
        [OUTBOX_PARTITION_KEY]: `OUTBOX#${messageId}`,
        [OUTBOX_SORT_KEY]: `OUTBOX#${messageId}`,
      },
      UpdateExpression: 'SET #status = :status, processedAt = :processedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'processed',
        ':processedAt': processedAt.toISOString(),
      },
    });

    await this.client.send(command);
    this.logger.debug(`Mensaje marcado como procesado: ${messageId}`);
  }

  async markAsFailed(messageId: string, error: string): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.config.tableName,
      Key: {
        [OUTBOX_PARTITION_KEY]: `OUTBOX#${messageId}`,
        [OUTBOX_SORT_KEY]: `OUTBOX#${messageId}`,
      },
      UpdateExpression:
        'SET #status = :status, lastError = :error, retryCount = retryCount + :one',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'failed',
        ':error': error,
        ':one': 1,
      },
    });

    await this.client.send(command);
    this.logger.warn(`Mensaje marcado como fallido: ${messageId}, error: ${error}`);
  }

  async existsByEventId(eventId: string): Promise<boolean> {
    const command = new QueryCommand({
      TableName: this.config.tableName,
      IndexName: this.config.gsi1Name,
      KeyConditionExpression: 'eventId = :eventId',
      ExpressionAttributeValues: {
        ':eventId': eventId,
      },
      Limit: 1,
    });

    const response = await this.client.send(command);
    return (response.Items?.length ?? 0) > 0;
  }

  async updateRetryCount(messageId: string): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.config.tableName,
      Key: {
        [OUTBOX_PARTITION_KEY]: `OUTBOX#${messageId}`,
        [OUTBOX_SORT_KEY]: `OUTBOX#${messageId}`,
      },
      UpdateExpression: 'SET retryCount = retryCount + :one',
      ExpressionAttributeValues: {
        ':one': 1,
      },
    });

    await this.client.send(command);
  }

  async deleteOldProcessedMessages(olderThan: Date): Promise<number> {
    const command = new ScanCommand({
      TableName: this.config.tableName,
      FilterExpression: '#status = :status AND processedAt < :olderThan',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'processed',
        ':olderThan': olderThan.toISOString(),
      },
    });

    const response = await this.client.send(command);
    const items = response.Items || [];
    let deletedCount = 0;

    for (const item of items) {
      const deleteCommand = new DeleteCommand({
        TableName: this.config.tableName,
        Key: {
          [OUTBOX_PARTITION_KEY]: item.pk,
          [OUTBOX_SORT_KEY]: item.sk,
        },
      });
      await this.client.send(deleteCommand);
      deletedCount++;
    }

    this.logger.log(`Eliminados ${deletedCount} mensajes procesados antiguos`);
    return deletedCount;
  }

  private toDynamoDBItem(message: OutboxMessage): Record<string, unknown> {
    return {
      pk: `OUTBOX#${message.messageId}`,
      sk: `OUTBOX#${message.messageId}`,
      messageId: message.messageId,
      eventId: message.eventId,
      eventType: message.eventType,
      payload: message.payload,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      processedAt: message.processedAt?.toISOString(),
      retryCount: message.retryCount || 0,
      lastError: message.lastError,
      gsi1pk: `STATUS#${message.status}`,
      gsi1sk: `CREATED#${message.createdAt.getTime()}`,
    };
  }

  private fromDynamoDBItem(item: Record<string, unknown>): OutboxMessage {
    return {
      messageId: item.messageId as string,
      eventId: item.eventId as string,
      eventType: item.eventType as string,
      payload: item.payload as Record<string, unknown>,
      status: item.status as 'pending' | 'processed' | 'failed',
      createdAt: new Date(item.createdAt as string),
      processedAt: item.processedAt ? new Date(item.processedAt as string) : undefined,
      retryCount: (item.retryCount as number) || 0,
      lastError: item.lastError as string | undefined,
    };
  }
}
// === ARCHIVO: src/infrastructure/outbox/postgresql/postgresql-outbox.repository.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { OutboxMessage } from '@domain/models/outbox-message.model';
import {
  OutboxRepository,
  OutboxMessageFilter,
} from '../outbox.repository';

export interface PostgreSQLOutboxConfig {
  readonly schema: string;
  readonly tableName: string;
  readonly maxRetries: number;
  readonly retentionDays: number;
}

const DEFAULT_CONFIG: PostgreSQLOutboxConfig = {
  schema: 'outbox',
  tableName: 'messages',
  maxRetries: 5,
  retentionDays: 7,
};

@Injectable()
export class PostgreSqlOutboxRepository implements OutboxRepository {
  private readonly logger = new Logger(PostgreSqlOutboxRepository.name);
  private readonly pool: Pool;
  private readonly config: PostgreSQLOutboxConfig;

  constructor(pool: Pool, config?: Partial<PostgreSQLOutboxConfig>) {
    this.pool = pool;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    const createSchemaSQL = `
      CREATE SCHEMA IF NOT EXISTS ${this.config.schema};
    `;
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.schema}.${this.config.tableName} (
        message_id VARCHAR(255) PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL UNIQUE,
        event_type VARCHAR(255) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMP WITH TIME ZONE,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        CONSTRAINT chk_status CHECK (status IN ('pending', 'processed', 'failed'))
      );
    `;
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_outbox_status_created
      ON ${this.config.schema}.${this.config.tableName} (status, created_at);
      CREATE INDEX IF NOT EXISTS idx_outbox_event_type
      ON ${this.config.schema}.${this.config.tableName} (event_type);
      CREATE INDEX IF NOT EXISTS idx_outbox_event_id
      ON ${this.config.schema}.${this.config.tableName} (event_id);
    `;

    try {
      await this.pool.query(createSchemaSQL);
      await this.pool.query(createTableSQL);
      await this.pool.query(createIndexSQL);
      this.logger.log(
        `Esquema ${this.config.schema} y tabla ${this.config.tableName} inicializados`,
      );
    } catch (error) {
      this.logger.error('Error al inicializar el outbox en PostgreSQL', error);
      throw error;
    }
  }

  async save(message: OutboxMessage): Promise<void> {
    const exists = await this.existsByEventId(message.eventId);
    if (exists) {
      this.logger.warn(
        `Mensaje con eventId ${message.eventId} ya existe, evitando duplicado`,
      );
      return;
    }

    const insertSQL = `
      INSERT INTO ${this.config.schema}.${this.config.tableName}
        (message_id, event_id, event_type, payload, status, created_at, retry_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (event_id) DO NOTHING
    `;

    const values = [
      message.messageId,
      message.eventId,
      message.eventType,
      JSON.stringify(message.payload),
      message.status,
      message.createdAt,
      message.retryCount || 0,
    ];

    try {
      const result = await this.pool.query(insertSQL, values);
      if (result.rowCount === 0) {
        this.logger.warn(
          `Duplicado detectado para eventId: ${message.eventId}, saltando`,
        );
      } else {
        this.logger.debug(`Mensaje guardado en outbox: ${message.messageId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error al guardar mensaje en outbox: ${message.messageId}`,
        error,
      );
      throw error;
    }
  }

  async saveBatch(messages: OutboxMessage[]): Promise<void> {
    if (messages.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertSQL = `
        INSERT INTO ${this.config.schema}.${this.config.tableName}
          (message_id, event_id, event_type, payload, status, created_at, retry_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (event_id) DO NOTHING
      `;

      for (const message of messages) {
        const values = [
          message.messageId,
          message.eventId,
          message.eventType,
          JSON.stringify(message.payload),
          message.status,
          message.createdAt,
          message.retryCount || 0,
        ];
        await client.query(insertSQL, values);
      }

      await client.query('COMMIT');
      this.logger.debug(`Batch de ${messages.length} mensajes guardado en outbox`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error al guardar batch en outbox', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findPending(limit: number): Promise<OutboxMessage[]> {
    const selectSQL = `
      SELECT message_id, event_id, event_type, payload, status,
             created_at, processed_at, retry_count, last_error
      FROM ${this.config.schema}.${this.config.tableName}
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT $1
    `;

    try {
      const result = await this.pool.query(selectSQL, [limit]);
      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.logger.error('Error al buscar mensajes pendientes', error);
      throw error;
    }
  }

  async findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filter.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filter.status);
    }

    if (filter.eventType) {
      conditions.push(`event_type = $${paramIndex++}`);
      values.push(filter.eventType);
    }

    if (filter.fromDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      values.push(filter.fromDate);
    }

    if (filter.toDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      values.push(filter.toDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter.limit || 100;

    const selectSQL = `
      SELECT message_id, event_id, event_type, payload, status,
             created_at, processed_at, retry_count, last_error
      FROM ${this.config.schema}.${this.config.tableName}
      ${whereClause}
      ORDER BY created_at ASC
      LIMIT $${paramIndex}
    `;

    values.push(limit);

    try {
      const result = await this.pool.query(selectSQL, values);
      return result.rows.map((row) => this.mapRowToMessage(row));
    } catch (error) {
      this.logger.error('Error al buscar mensajes con filtro', error);
      throw error;
    }
  }

  async markAsProcessed(messageId: string, processedAt: Date): Promise<void> {
    const updateSQL = `
      UPDATE ${this.config.schema}.${this.config.tableName}
      SET status = 'processed', processed_at = $2
      WHERE message_id = $1
    `;

    try {
      await this.pool.query(updateSQL, [messageId, processedAt]);
      this.logger.debug(`Mensaje marcado como procesado: ${messageId}`);
    } catch (error) {
      this.logger.error(
        `Error al marcar mensaje como procesado: ${messageId}`,
        error,
      );
      throw error;
    }
  }

  async markAsFailed(messageId: string, error: string): Promise<void> {
    const updateSQL = `
      UPDATE ${this.config.schema}.${this.config.tableName}
      SET status = 'failed', last_error = $2, retry_count = retry_count + 1
      WHERE message_id = $1
    `;

    try {
      await this.pool.query(updateSQL, [messageId, error]);
      this.logger.warn(
        `Mensaje marcado como fallido: ${messageId}, error: ${error}`,
      );
    } catch (error) {
      this.logger.error(`Error al marcar mensaje como fallido: ${messageId}`, error);
      throw error;
    }
  }

  async existsByEventId(eventId: string): Promise<boolean> {
    const selectSQL = `
      SELECT 1 FROM ${this.config.schema}.${this.config.tableName}
      WHERE event_id = $1
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(selectSQL, [eventId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia de eventId: ${eventId}`, error);
      throw error;
    }
  }

  async updateRetryCount(messageId: string): Promise<void> {
    const updateSQL = `
      UPDATE ${this.config.schema}.${this.config.tableName}
      SET retry_count = retry_count + 1
      WHERE message_id = $1
    `;

    try {
      await this.pool.query(updateSQL, [messageId]);
    } catch (error) {
      this.logger.error(
        `Error al actualizar retry count para: ${messageId}`,
        error,
      );
      throw error;
    }
  }

  async deleteOldProcessedMessages(olderThan: Date): Promise<number> {
    const deleteSQL = `
      DELETE FROM ${this.config.schema}.${this.config.tableName}
      WHERE status = 'processed' AND processed_at < $1
    `;

    try {
      const result = await this.pool.query(deleteSQL, [olderThan]);
      const deletedCount = result.rowCount || 0;
      this.logger.log(
        `Eliminados ${deletedCount} mensajes procesados antiguos`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error('Error al eliminar mensajes procesados antiguos', error);
      throw error;
    }
  }

  private mapRowToMessage(row: Record<string, unknown>): OutboxMessage {
    return {
      messageId: row.message_id as string,
      eventId: row.event_id as string,
      eventType: row.event_type as string,
      payload: typeof row.payload === 'string'
        ? JSON.parse(row.payload)
        : row.payload as Record<string, unknown>,
      status: row.status as 'pending' | 'processed' | 'failed',
      createdAt: new Date(row.created_at as string),
      processedAt: row.processed_at
        ? new Date(row.processed_at as string)
        : undefined,
      retryCount: (row.retry_count as number) || 0,
      lastError: row.last_error as string | undefined,
    };
  }
}

// === ARCHIVO: src/infrastructure/message-brokers/message-broker.interface.ts ===
import { Injectable } from '@nestjs/common';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';

export enum MessageBrokerType {
  KAFKA = 'KAFKA',
  SQS = 'SQS',
}

export interface MessageEnvelope<T = unknown> {
  readonly topic: string;
  readonly partition?: number;
  readonly key?: string;
  readonly value: T;
  readonly headers?: Record<string, string>;
  readonly timestamp?: string;
}

export interface PublishOptions {
  readonly key?: string;
  readonly headers?: Record<string, string>;
  readonly partition?: number;
  readonly acks?: 'all' | 'leader' | '0';
  readonly timeout?: number;
}

export interface SubscribeOptions {
  readonly groupId: string;
  readonly fromBeginning?: boolean;
  readonly autoCommit?: boolean;
  readonly partitionsConsumedConcurrently?: number;
}

export interface MessageHandler<T = unknown> {
  (envelope: MessageEnvelope<T>): Promise<void>;
}

export interface MessageBrokerMetrics {
  readonly messagesPublished: number;
  readonly messagesConsumed: number;
  readonly publishFailures: number;
  readonly consumeFailures: number;
  readonly averageLatencyMs: number;
  readonly lastMessageAt?: Date;
}

export interface IMessageBroker {
  readonly brokerType: MessageBrokerType;
  readonly isConnected: boolean;

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  publish<T>(
    topic: string,
    message: T,
    options?: PublishOptions,
  ): Promise<string>;

  subscribe<T>(
    topic: string,
    handler: MessageHandler<T>,
    options: SubscribeOptions,
  ): Promise<void>;

  unsubscribe(topic: string): Promise<void>;

  getMetrics(): MessageBrokerMetrics;

  pause(topic: string): Promise<void>;
  resume(topic: string): Promise<void>;
}

@Injectable()
export abstract class MessageBrokerBase implements IMessageBroker {
  abstract readonly brokerType: MessageBrokerType;
  abstract readonly isConnected: boolean;

  protected metrics: MessageBrokerMetrics = {
    messagesPublished: 0,
    messagesConsumed: 0,
    publishFailures: 0,
    consumeFailures: 0,
    averageLatencyMs: 0,
  };

  protected startTime: number = Date.now();

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract publish<T>(
    topic: string,
    message: T,
    options?: PublishOptions,
  ): Promise<string>;
  abstract subscribe<T>(
    topic: string,
    handler: MessageHandler<T>,
    options: SubscribeOptions,
  ): Promise<void>;
  abstract unsubscribe(topic: string): Promise<void>;
  abstract pause(topic: string): Promise<void>;
  abstract resume(topic: string): Promise<void>;

  getMetrics(): MessageBrokerMetrics {
    return {
      ...this.metrics,
      lastMessageAt:
        this.metrics.messagesPublished > 0 || this.metrics.messagesConsumed > 0
          ? new Date()
          : undefined,
    };
  }

  protected incrementPublish(): void {
    this.metrics.messagesPublished++;
  }

  protected incrementConsume(): void {
    this.metrics.messagesConsumed++;
  }

  protected incrementPublishFailure(): void {
    this.metrics.publishFailures++;
  }

  protected incrementConsumeFailure(): void {
    this.metrics.consumeFailures++;
  }

  protected updateLatency(latencyMs: number): void {
    const totalMessages =
      this.metrics.messagesPublished + this.metrics.messagesConsumed;
    if (totalMessages === 0) {
      this.metrics.averageLatencyMs = latencyMs;
    } else {
      this.metrics.averageLatencyMs =
        (this.metrics.averageLatencyMs * (totalMessages - 1) + latencyMs) /
        totalMessages;
    }
  }
}

export type DomainEvent = CreditOriginatedEvent | FraudCheckedEvent;

// === ARCHIVO: src/infrastructure/message-brokers/kafka/kafka-producer.service.ts ===
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Kafka,
  Producer,
  ProducerRecord,
  RecordMetadata,
  CompressionTypes,
  logLevel,
} from 'kafkajs';
import { backOff } from 'exponential-backoff';
import {
  MessageBrokerBase,
  MessageBrokerType,
  MessageEnvelope,
  PublishOptions,
  MessageHandler,
  SubscribeOptions,
} from '../message-broker.interface';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';

interface KafkaProducerConfig {
  readonly clientId: string;
  readonly brokers: string[];
  readonly compression: CompressionTypes;
  readonly allowAutoCreateTopics: boolean;
  readonly transactionTimeout: number;
  readonly maxInFlightRequests: number;
  readonly connectionTimeout: number;
  readonly authenticationTimeout: number;
  readonly reauthenticationThreshold: number;
}

interface BackpressureConfig {
  readonly maxInFlight: number;
  readonly queueSize: number;
  readonly flushTimeoutMs: number;
  readonly enableMetrics: boolean;
}

interface PendingMessage {
  readonly resolve: (value: string) => void;
  readonly reject: (reason: Error) => void;
  readonly timestamp: number;
  readonly topic: string;
}

@Injectable()
export class KafkaProducerService
  extends MessageBrokerBase
  implements OnModuleInit, OnModuleDestroy
{
  readonly brokerType = MessageBrokerType.KAFKA;
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;
  private isInitialized = false;

  private pendingMessages: Map<string, PendingMessage> = new Map();
  private messageQueue: Array<{
    topic: string;
    message: unknown;
    options?: PublishOptions;
    resolve: (value: string) => void;
    reject: (reason: Error) => void;
  }> = [];

  private readonly producerConfig: KafkaProducerConfig;
  private readonly backpressureConfig: BackpressureConfig;
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
    this.producerConfig = this.buildProducerConfig();
    this.backpressureConfig = this.buildBackpressureConfig();
    this.kafka = new Kafka({
      clientId: this.producerConfig.clientId,
      brokers: this.producerConfig.brokers,
      compression: this.producerConfig.compression,
      allowAutoCreateTopics: this.producerConfig.allowAutoCreateTopics,
      connectionTimeout: this.producerConfig.connectionTimeout,
      authenticationTimeout: this.producerConfig.authenticationTimeout,
      reauthenticationThreshold: this.producerConfig.reauthenticationThreshold,
      logLevel: logLevel.WARN,
    });
    this.producer = this.kafka.producer({
      transactionTimeout: this.producerConfig.transactionTimeout,
      maxInFlightRequests: this.producerConfig.maxInFlightRequests,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  get isConnected(): boolean {
    return this.isInitialized;
  }

  async connect(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Producer already connected');
      return;
    }

    try {
      await backOff(
        async () => {
          this.logger.log('Connecting Kafka producer...');
          await this.producer.connect();
          this.isInitialized = true;
          this.logger.log('Kafka producer connected successfully');
        },
        {
          maxDelay: 30000,
          numOfAttempts: 5,
          startingDelay: 1000,
          jitter: 'full',
          retry: (error: Error) => {
            this.logger.error(
              `Failed to connect: ${error.message}`,
              error.stack,
            );
            return true;
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect after retries: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
        this.flushTimeout = null;
      }

      await this.producer.disconnect();
      this.isInitialized = false;
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.error(
        `Error disconnecting: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async publish<T>(
    topic: string,
    message: T,
    options?: PublishOptions,
  ): Promise<string> {
    const startTime = Date.now();

    if (!this.isInitialized) {
      throw new Error('Producer not connected');
    }

    const messageId = this.generateMessageId(topic, message);
    const inFlightCount = this.pendingMessages.size;

    if (inFlightCount >= this.backpressureConfig.maxInFlight) {
      this.logger.warn(
        `Backpressure: ${inFlightCount} in-flight messages, queuing...`,
      );
      return new Promise((resolve, reject) => {
        this.messageQueue.push({
          topic,
          message,
          options,
          resolve,
          reject,
        });
        this.scheduleFlush();
      });
    }

    return this.doPublish(topic, message, options, messageId, startTime);
  }

  private async doPublish<T>(
    topic: string,
    message: T,
    options: PublishOptions | undefined,
    messageId: string,
    startTime: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pendingMessages.set(messageId, {
        resolve,
        reject,
        timestamp: startTime,
        topic,
      });

      const record = this.buildRecord(topic, message, options);

      this.producer
        .send(record)
        .then((results: RecordMetadata[]) => {
          const pending = this.pendingMessages.get(messageId);
          if (pending) {
            pending.resolve(messageId);
            this.pendingMessages.delete(messageId);
          }
          this.incrementPublish();
          this.updateLatency(Date.now() - startTime);

          const partition = results[0]?.partition;
          const offset = results[0]?.offset;
          this.logger.debug(
            `Message ${messageId} published to ${topic}[${partition}]@${offset}`,
          );
        })
        .catch((error: Error) => {
          const pending = this.pendingMessages.get(messageId);
          if (pending) {
            pending.reject(error);
            this.pendingMessages.delete(messageId);
          }
          this.incrementPublishFailure();
          this.logger.error(
            `Failed to publish to ${topic}: ${error.message}`,
            error.stack,
          );
          reject(error);
        });
    });
  }

  private buildRecord<T>(
    topic: string,
    message: T,
    options?: PublishOptions,
  ): ProducerRecord {
    const record: ProducerRecord = {
      topic,
      compression: CompressionTypes.GZIP,
      acks: options?.acks ?? 'all',
      timeout: options?.timeout ?? 30000,
      messages: [
        {
          key: options?.key ?? this.generateKey(message),
          value: JSON.stringify(message),
          timestamp: options?.timestamp ?? Date.now().toString(),
          headers: {
            'content-type': 'application/json',
            'message-id': this.generateMessageId(topic, message),
            ...options?.headers,
          },
        },
      ],
    };

    if (options?.partition !== undefined) {
      record.messages[0].partition = options.partition;
    }

    return record;
  }

  private generateMessageId<T>(topic: string, message: T): string {
    const content = JSON.stringify(message);
    return `${topic}-${Date.now()}-${content.substring(0, 50)}`;
  }

  private generateKey<T>(message: T): string {
    if (
      typeof message === 'object' &&
      message !== null &&n      'creditId' in message
    ) {
      return (message as { creditId: string }).creditId;
    }
    if (
      typeof message === 'object' &&
      message !== null &&
      'data' in message &&
      typeof (message as { data: unknown }).data === 'object' &&
      (message as { data: { creditId?: string } }).data?.creditId
    ) {
      return (message as { data: { creditId: string } }).data.creditId;
    }
    return `key-${Date.now()}`;
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      return;
    }

    this.flushTimeout = setTimeout(async () => {
      this.flushTimeout = null;
      await this.flushQueue();
    }, this.backpressureConfig.flushTimeoutMs);
  }

  private async flushQueue(): Promise<void> {
    const inFlightCount = this.pendingMessages.size;
    const availableSlots =
      this.backpressureConfig.maxInFlight - inFlightCount;

    if (availableSlots <= 0 || this.messageQueue.length === 0) {
      return;
    }

    const toProcess = this.messageQueue.splice(0, availableSlots);
    this.logger.debug(
      `Processing ${toProcess.length} queued messages (${this.messageQueue.length} remaining)`,
    );

    const promises = toProcess.map(({ topic, message, options, resolve, reject }) =>
      this.doPublish(topic, message, options, this.generateMessageId(topic, message), Date.now())
        .then(resolve)
        .catch(reject),
    );

    await Promise.allSettled(promises);
  }

  async subscribe<T>(
    topic: string,
    handler: MessageHandler<T>,
    options: SubscribeOptions,
  ): Promise<void> {
    this.logger.warn(
      'subscribe() not implemented in producer service - use consumer service',
    );
  }

  async unsubscribe(topic: string): Promise<void> {
    this.logger.warn(
      'unsubscribe() not implemented in producer service',
    );
  }

  async pause(topic: string): Promise<void> {
    this.logger.warn('pause() not implemented in producer service');
  }

  async resume(topic: string): Promise<void> {
    this.logger.warn('resume() not implemented in producer service');
  }

  private buildProducerConfig(): KafkaProducerConfig {
    return {
      clientId:
        this.configService.get<string>('KAFKA_CLIENT_ID') ??
        'credit-processing-producer',
      brokers: (
        this.configService.get<string>('KAFKA_BROKERS') ?? 'localhost:9092'
      ).split(','),
      compression: CompressionTypes.GZIP,
      allowAutoCreateTopics:
        this.configService.get<boolean>('KAFKA_ALLOW_AUTO_CREATE_TOPICS') ??
        false,
      transactionTimeout:
        this.configService.get<number>('KAFKA_TRANSACTION_TIMEOUT') ?? 30000,
      maxInFlightRequests:
        this.configService.get<number>('KAFKA_MAX_IN_FLIGHT_REQUESTS') ?? 5,
      connectionTimeout:
        this.configService.get<number>('KAFKA_CONNECTION_TIMEOUT') ?? 10000,
      authenticationTimeout:
        this.configService.get<number>('KAFKA_AUTHENTICATION_TIMEOUT') ?? 10000,
      reauthenticationThreshold:
        this.configService.get<number>('KAFKA_REAUTHENTICATION_THRESHOLD') ?? 10000,
    };
  }

  private buildBackpressureConfig(): BackpressureConfig {
    return {
      maxInFlight:
        this.configService.get<number>('KAFKA_MAX_IN_FLIGHT') ?? 100,
      queueSize:
        this.configService.get<number>('KAFKA_QUEUE_SIZE') ?? 1000,
      flushTimeoutMs:
        this.configService.get<number>('KAFKA_FLUSH_TIMEOUT_MS') ?? 100,
      enableMetrics:
        this.configService.get<boolean>('KAFKA_ENABLE_METRICS') ?? true,
    };
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getInFlightCount(): number {
    return this.pendingMessages.size;
  }
}

// === ARCHIVO: src/infrastructure/message-brokers/kafka/kafka-consumer.service.ts ===
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Kafka,
  Consumer,
  EachMessagePayload,
  KafkaMessage,
  CompressionTypes,
  logLevel,
  EachBatchPayload,
} from 'kafkajs';
import { backOff } from 'exponential-backoff';
import {
  MessageBrokerBase,
  MessageBrokerType,
  MessageEnvelope,
  MessageHandler,
  SubscribeOptions,
} from '../message-broker.interface';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';

interface KafkaConsumerConfig {
  readonly clientId: string;
  readonly brokers: string[];
  readonly groupId: string;
  readonly sessionTimeout: number;
  readonly heartbeatInterval: number;
  readonly maxWaitTimeInMs: number;
  readonly minBytes: number;
  readonly maxBytes: number;
  readonly maxInFlightRequests: number;
  readonly readUncommitted: boolean;
}

interface RetryConfig {
  readonly maxRetries: number;
  readonly initialIntervalMs: number;
  readonly maxIntervalMs: number;
  readonly multiplier: number;
  readonly jitter: boolean;
}

interface ProcessingResult {
  readonly success: boolean;
  readonly retryable: boolean;
  readonly error?: Error;
}

interface ConsumerSubscription {
  topic: string;
  handler: MessageHandler<unknown>;
  options: SubscribeOptions;
  isPaused: boolean;
}

@Injectable()
export class KafkaConsumerService
  extends MessageBrokerBase
  implements OnModuleInit, OnModuleDestroy
{
  readonly brokerType = MessageBrokerType.KAFKA;
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private isInitialized = false;

  private subscriptions: Map<string, ConsumerSubscription> = new Map();
  private readonly consumerConfig: KafkaConsumerConfig;
  private readonly retryConfig: RetryConfig;
  private readonly deadLetterTopic: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.consumerConfig = this.buildConsumerConfig();
    this.retryConfig = this.buildRetryConfig();
    this.deadLetterTopic =
      this.configService.get<string>('KAFKA_DLQ_TOPIC') ?? 'credit-events-dlq';

    this.kafka = new Kafka({
      clientId: this.consumerConfig.clientId,
      brokers: this.consumerConfig.brokers,
      logLevel: logLevel.WARN,
    });

    this.consumer = this.kafka.consumer({
      groupId: this.consumerConfig.groupId,
      sessionTimeout: this.consumerConfig.sessionTimeout,
      heartbeatInterval: this.consumerConfig.heartbeatInterval,
      maxInFlightRequests: this.consumerConfig.maxInFlightRequests,
      readUncommitted: this.consumerConfig.readUncommitted,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  get isConnected(): boolean {
    return this.isInitialized;
  }

  async connect(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Consumer already connected');
      return;
    }

    try {
      await backOff(
        async () => {
          this.logger.log('Connecting Kafka consumer...');
          await this.consumer.connect();
          this.isInitialized = true;
          this.logger.log('Kafka consumer connected successfully');
        },
        {
          maxDelay: 30000,
          numOfAttempts: 5,
          startingDelay: 1000,
          jitter: 'full',
          retry: (error: Error) => {
            this.logger.error(
              `Failed to connect: ${error.message}`,
              error.stack,
            );
            return true;
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect after retries: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      for (const [topic] of this.subscriptions) {
        await this.consumer.unsubscribe({ topic });
      }
      this.subscriptions.clear();

      await this.consumer.disconnect();
      this.isInitialized = false;
      this.logger.log('Kafka consumer disconnected');
    } catch (error) {
      this.logger.error(
        `Error disconnecting: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async subscribe<T>(
    topic: string,
    handler: MessageHandler<T>,
    options: SubscribeOptions,
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Consumer not connected');
    }

    if (this.subscriptions.has(topic)) {
      this.logger.warn(`Already subscribed to topic: ${topic}`);
      return;
    }

    const subscription: ConsumerSubscription = {
      topic,
      handler: handler as MessageHandler<unknown>,
      options,
      isPaused: false,
    };

    this.subscriptions.set(topic, subscription);

    await this.consumer.subscribe({
      topic,
      fromBeginning: options.fromBeginning ?? false,
    });

    await this.consumer.run({
      partitionsConsumedConcurrently: options.partitionsConsumedConcurrently ?? 1,
      eachMessage: async (payload: EachMessagePayload) => {
        if (subscription.isPaused) {
          this.logger.debug(`Skipping message on paused topic: ${topic}`);
          return;
        }
        await this.handleMessage(topic, payload, handler as MessageHandler<unknown>);
      },
      eachBatch: async (payload: EachBatchPayload) => {
        if (subscription.isPaused) {
          this.logger.debug(`Skipping batch on paused topic: ${topic}`);
          return;
        }
        await this.handleBatch(topic, payload, handler as MessageHandler<unknown>);
      },
    });

    this.logger.log(`Subscribed to topic: ${topic} with group: ${options.groupId}`);
  }

  private async handleMessage(
    topic: string,
    payload: EachMessagePayload,
    handler: MessageHandler<unknown>,
  ): Promise<void> {
    const { message, partition, topic: msgTopic } = payload;
    const startTime = Date.now();

    try {
      const envelope = this.parseMessage(message, msgTopic);
      this.logger.debug(
        `Processing message from ${msgTopic}[${partition}]@${message.offset}`,
      );

      const result = await this.processWithRetry(envelope, handler);

      if (result.success) {
        this.incrementConsume();
        this.updateLatency(Date.now() - startTime);
      } else if (result.retryable) {
        this.logger.warn(
          `Retryable error processing message: ${result.error?.message}`,
        );
      } else {
        this.incrementConsumeFailure();
        await this.sendToDeadLetter(topic, message, result.error);
      }
    } catch (error) {
      this.incrementConsumeFailure();
      this.logger.error(
        `Error processing message: ${(error as Error).message}`,
        (error as Error).stack,
      );
      await this.sendToDeadLetter(topic, message, error as Error);
    }
  }

  private async handleBatch(
    topic: string,
    payload: EachBatchPayload,
    handler: MessageHandler<unknown>,
  ): Promise<void> {
    const { batch, resolveOffset, heartbeat, commitOffsetsIfNecessary, isRunning, isStale } =
      payload;

    this.logger.debug(
      `Processing batch of ${batch.messages.length} messages from ${batch.topic}`,
    );

    for (const message of batch.messages) {
      if (!isRunning() || isStale()) {
        break;
      }

      await heartbeat();

      try {
        const envelope = this.parseMessage(message, batch.topic);
        const result = await this.processWithRetry(envelope, handler);

        if (result.success) {
          this.incrementConsume();
          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
        } else if (result.retryable) {
          this.incrementConsumeFailure();
          await this.sendToDeadLetter(topic, message, result.error);
          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
        } else {
          this.incrementConsumeFailure();
          await this.sendToDeadLetter(topic, message, result.error);
          resolveOffset(message.offset);
          await commitOffsetsIfNecessary();
        }
      } catch (error) {
        this.incrementConsumeFailure();
        this.logger.error(
          `Error in batch processing: ${(error as Error).message}`,
          (error as Error).stack,
        );
        await this.sendToDeadLetter(topic, message, error as Error);
        resolveOffset(message.offset);
        await commitOffsetsIfNecessary();
      }
    }
  }

  private parseMessage(message: KafkaMessage, topic: string): MessageEnvelope {
    const value = message.value ? JSON.parse(message.value.toString()) : null;
    const headers: Record<string, string> = {};

    if (message.headers) {
      for (const [key, val] of Object.entries(message.headers)) {
        headers[key] = val?.toString() ?? '';
      }
    }

    return {
      topic,
      partition: message.partition,
      key: message.key?.toString(),
      value,
      headers,
      timestamp: message.timestamp,
    };
  }

  private async processWithRetry(
    envelope: MessageEnvelope,
    handler: MessageHandler<unknown>,
  ): Promise<ProcessingResult> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        await handler(envelope);
        return { success: true, retryable: false };
      } catch (error) {
        lastError = error as Error;
        const isRetryable = this.isRetryableError(error as Error);

        if (!isRetryable || attempt === this.retryConfig.maxRetries) {
          return {
            success: false,
            retryable: false,
            error: lastError,
          };
        }

        const delay = this.calculateRetryDelay(attempt);
        this.logger.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message}`,
        );

        await this.sleep(delay);
      }
    }

    return {
      success: false,
      retryable: true,
      error: lastError,
    };
  }

  private calculateRetryDelay(attempt: number): number {
    const { initialIntervalMs, maxIntervalMs, multiplier, jitter } = this.retryConfig;
    let delay = Math.min(
      initialIntervalMs * Math.pow(multiplier, attempt),
      maxIntervalMs,
    );

    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /timeout/i,
      /network/i,
      /temporarily unavailable/i,
      /service unavailable/i,
    ];

    return retryablePatterns.some((pattern) => pattern.test(error.message));
  }

  private async sendToDeadLetter(
    topic: string,
    message: KafkaMessage,
    error?: Error,
  ): Promise<void> {
    try {
      this.logger.error(
        `Sending message to DLQ: ${topic} - ${error?.message ?? 'unknown error'}`,
      );
    } catch (sendError) {
      this.logger.error(
        `Failed to send to DLQ: ${(sendError as Error).message}`,
        (sendError as Error).stack,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async unsubscribe(topic: string): Promise<void> {
    const subscription = this.subscriptions.get(topic);
    if (!subscription) {
      this.logger.warn(`Not subscribed to topic: ${topic}`);
      return;
    }

    await this.consumer.unsubscribe({ topic });
    this.subscriptions.delete(topic);
    this.logger.log(`Unsubscribed from topic: ${topic}`);
  }

  async pause(topic: string): Promise<void> {
    const subscription = this.subscriptions.get(topic);
    if (!subscription) {
      this.logger.warn(`Not subscribed to topic: ${topic}`);
      return;
    }

    subscription.isPaused = true;
    await this.consumer.pause([{ topic }]);
    this.logger.log(`Paused consumption from topic: ${topic}`);
  }

  async resume(topic: string): Promise<void> {
    const subscription = this.subscriptions.get(topic);
    if (!subscription) {
      this.logger.warn(`Not subscribed to topic: ${topic}`);
      return;
    }

    subscription.isPaused = false;
    await this.consumer.resume([{ topic }]);
    this.logger.log(`Resumed consumption from topic: ${topic}`);
  }

  async publish<T>(
    topic: string,
    message: T,
    options?: {
      readonly key?: string;
      readonly headers?: Record<string, string>;
      readonly partition?: number;
      readonly acks?: 'all' | 'leader' | '0';
      readonly timeout?: number;
    },
  ): Promise<string> {
    this.logger.warn(
      'publish() not implemented in consumer service - use producer service',
    );
    throw new Error('Not implemented - use producer service');
  }

  private buildConsumerConfig(): KafkaConsumerConfig {
    return {
      clientId:
        this.configService.get<string>('KAFKA_CLIENT_ID') ??
        'credit-processing-consumer',
      brokers: (
        this.configService.get<string>('KAFKA_BROKERS') ?? 'localhost:9092'
      ).split(','),
      groupId:
        this.configService.get<string>('KAFKA_CONSUMER_GROUP_ID') ??
        'credit-processing-group',
      sessionTimeout:
        this.configService.get<number>('KAFKA_SESSION_TIMEOUT') ?? 30000,
      heartbeatInterval:
        this.configService.get<number>('KAFKA_HEARTBEAT_INTERVAL') ?? 3000,
      maxWaitTimeInMs:
        this.configService.get<number>('KAFKA_MAX_WAIT_TIME_MS') ?? 5000,
      minBytes: this.configService.get<number>('KAFKA_MIN_BYTES') ?? 1,
      maxBytes: this.configService.get<number>('KAFKA_MAX_BYTES') ?? 10485760,
      maxInFlightRequests:
        this.configService.get<number>('KAFKA_MAX_IN_FLIGHT_REQUESTS') ?? 5,
      readUncommitted:
        this.configService.get<boolean>('KAFKA_READ_UNCOMMITTED') ?? false,
    };
  }

  private buildRetryConfig(): RetryConfig {
    return {
      maxRetries: this.configService.get<number>('KAFKA_MAX_RETRIES') ?? 3,
      initialIntervalMs:
        this.configService.get<number>('KAFKA_RETRY_INITIAL_INTERVAL_MS') ?? 1000,
      maxIntervalMs:
        this.configService.get<number>('KAFKA_RETRY_MAX_INTERVAL_MS') ?? 30000,
      multiplier: this.configService.get<number>('KAFKA_RETRY_MULTIPLIER') ?? 2,
      jitter: this.configService.get<boolean>('KAFKA_RETRY_JITTER') ?? true,
    };
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  isTopicPaused(topic: string): boolean {
    return this.subscriptions.get(topic)?.isPaused ?? false;
  }
}

// === ARCHIVO: src/infrastructure/message-brokers/sqs/sqs-producer.service.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class SqsProducerService {
  private readonly logger = new Logger(SqsProducerService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly maxRetries = 3;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.sqsClient = new SQSClient({ region });
    this.queueUrl = this.configService.get<string>('SQS_FIFO_QUEUE_URL') || '';
    
    if (!this.queueUrl) {
      throw new Error('SQS_FIFO_QUEUE_URL environment variable is required');
    }
  }

  async sendMessage(
    payload: Record<string, unknown>,
    options?: {
      deduplicationId?: string;
      messageGroupId?: string;
      delaySeconds?: number;
    },
  ): Promise<SendMessageCommandOutput> {
    const deduplicationId = options?.deduplicationId || randomUUID();
    const messageGroupId = options?.messageGroupId || 'default-group';
    
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(payload),
      MessageDeduplicationId: deduplicationId,
      MessageGroupId: messageGroupId,
      DelaySeconds: options?.delaySeconds || 0,
    });

    try {
      const result = await this.sqsClient.send(command);
      this.logger.log(`Message sent to SQS FIFO: ${result.MessageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to SQS: ${error}`);
      throw error;
    }
  }

  async sendMessageWithRetry(
    payload: Record<string, unknown>,
    options?: {
      deduplicationId?: string;
      messageGroupId?: string;
      delaySeconds?: number;
    },
    attempt = 1,
  ): Promise<SendMessageCommandOutput> {
    try {
      return await this.sendMessage(payload, options);
    } catch (error) {
      if (attempt >= this.maxRetries) {
        this.logger.error(`Max retries reached for message: ${options?.deduplicationId}`);
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 100 + Math.random() * 100;
      this.logger.warn(`Retry attempt ${attempt} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.sendMessageWithRetry(payload, options, attempt + 1);
    }
  }

  async sendBatch(
    messages: Array<{
      payload: Record<string, unknown>;
      deduplicationId?: string;
      messageGroupId?: string;
    }>,
  ): Promise<void> {
    for (const message of messages) {
      await this.sendMessageWithRetry(message.payload, {
        deduplicationId: message.deduplicationId,
        messageGroupId: message.messageGroupId,
      });
    }
  }

  async publishEvent(
    eventType: string,
    eventData: Record<string, unknown>,
    correlationId: string,
  ): Promise<SendMessageCommandOutput> {
    const message = {
      eventType,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId,
      data: eventData,
    };

    return this.sendMessageWithRetry(message, {
      deduplicationId: correlationId,
      messageGroupId: eventType,
    });
  }

  async close(): Promise<void> {
    await this.sqsClient.destroy();
  }
}

// === ARCHIVO: src/infrastructure/message-brokers/sqs/sqs-consumer.service.ts ===
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { 
  SQSClient, 
  ReceiveMessageCommand, 
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SqsConsumerConfig {
  maxNumberOfMessages: number;
  waitTimeSeconds: number;
  visibilityTimeout: number;
  maxRetries?: number;
}

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly config: SqsConsumerConfig;
  private isPolling = false;
  private readonly messageHandlers: Map<string, (message: Record<string, unknown>) => Promise<void>>;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.sqsClient = new SQSClient({ region });
    this.queueUrl = this.configService.get<string>('SQS_FIFO_QUEUE_URL') || '';
    
    this.config = {
      maxNumberOfMessages: this.configService.get<number>('SQS_MAX_MESSAGES', 10),
      waitTimeSeconds: this.configService.get<number>('SQS_WAIT_TIME', 20),
      visibilityTimeout: this.configService.get<number>('SQS_VISIBILITY_TIMEOUT', 300),
      maxRetries: this.configService.get<number>('SQS_MAX_RETRIES', 3),
    };

    this.messageHandlers = new Map();
    
    if (!this.queueUrl) {
      throw new Error('SQS_FIFO_QUEUE_URL environment variable is required');
    }
  }

  async onModuleInit(): Promise<void> {
    this.startPolling();
  }

  async onModuleDestroy(): Promise<void> {
    this.isPolling = false;
    await this.sqsClient.destroy();
  }

  registerHandler(eventType: string, handler: (message: Record<string, unknown>) => Promise<void>): void {
    this.messageHandlers.set(eventType, handler);
    this.logger.log(`Registered handler for event type: ${eventType}`);
  }

  private startPolling(): void {
    this.isPolling = true;
    this.poll();
  }

  private async poll(): Promise<void> {
    while (this.isPolling) {
      try {
        await this.processMessages();
      } catch (error) {
        this.logger.error(`Error polling SQS: ${error}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessages(): Promise<void> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: this.config.maxNumberOfMessages,
      WaitTimeSeconds: this.config.waitTimeSeconds,
      VisibilityTimeout: this.config.visibilityTimeout,
      AttributeNames: ['All'],
      MessageAttributeNames: ['All'],
    });

    const response = await this.sqsClient.send(command);
    
    if (!response.Messages || response.Messages.length === 0) {
      return;
    }

    for (const message of response.Messages) {
      await this.handleMessage(message);
    }
  }

  private async handleMessage(message: AWS.SQS.Message): Promise<void> {
    if (!message.Body || !message.MessageId) {
      this.logger.warn('Received invalid message without Body or MessageId');
      return;
    }

    try {
      const parsed = JSON.parse(message.Body);
      const eventType = parsed.eventType || 'unknown';
      const handler = this.messageHandlers.get(eventType);

      if (handler) {
        this.logger.log(`Processing message ${message.MessageId} of type ${eventType}`);
        await handler(parsed);
        await this.deleteMessage(message.ReceiptHandle!);
      } else {
        this.logger.warn(`No handler registered for event type: ${eventType}`);
        await this.deleteMessage(message.ReceiptHandle!);
      }
    } catch (error) {
      this.logger.error(`Error processing message ${message.MessageId}: ${error}`);
      await this.handleFailure(message);
    }
  }

  private async handleFailure(message: AWS.SQS.Message): Promise<void> {
    const receiptHandle = message.ReceiptHandle;
    const attributes = message.Attributes;
    const approximateReceiveCount = parseInt(
      attributes?.ApproximateReceiveCount || '1',
      10
    );

    if (approximateReceiveCount >= (this.config.maxRetries || 3)) {
      this.logger.error(`Message ${message.MessageId} exceeded max retries, moving to DLQ`);
      await this.moveToDeadLetterQueue(message);
      return;
    }

    const visibilityTimeout = 45;
    await this.extendVisibilityTimeout(receiptHandle, visibilityTimeout);
    
    this.logger.warn(
      `Retrying message ${message.MessageId}, attempt ${approximateReceiveCount}`
    );
  }

  private async extendVisibilityTimeout(receiptHandle: string, timeout: number): Promise<void> {
    const command = new ChangeMessageVisibilityCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: timeout,
    });

    await this.sqsClient.send(command);
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqsClient.send(command);
  }

  private async moveToDeadLetterQueue(message: AWS.SQS.Message): Promise<void> {
    const dlqUrl = this.configService.get<string>('SQS_DLQ_URL');
    if (!dlqUrl) {
      this.logger.warn('DLQ not configured, message will be lost');
      await this.deleteMessage(message.ReceiptHandle!);
      return;
    }

    const dlqCommand = new SendMessageCommand({
      QueueUrl: dlqUrl,
      MessageBody: message.Body,
      MessageDeduplicationId: message.MessageId,
      MessageGroupId: 'dlq-group',
    });

    await this.sqsClient.send(dlqCommand);
    await this.deleteMessage(message.ReceiptHandle!);
    this.logger.log(`Message ${message.MessageId} moved to DLQ`);
  }

  async stop(): Promise<void> {
    this.isPolling = false;
  }

  async start(): Promise<void> {
    if (!this.isPolling) {
      this.startPolling();
    }
  }
}

// === ARCHIVO: src/infrastructure/saga/saga-coordinator.service.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { CompensationHandler } from './compensations/compensation.handler';
import { RetryStrategyService } from './retries/retry-strategy.service';
import { randomUUID } from 'crypto';

export enum SagaStepStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export interface SagaStep {
  stepId: string;
  name: string;
  status: SagaStepStatus;
  compensateAction?: () => Promise<void>;
  executeAction: () => Promise<void>;
  metadata?: Record<string, unknown>;
}

export interface SagaState {
  sagaId: string;
  correlationId: string;
  status: SagaStepStatus;
  steps: SagaStep[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface SagaDefinition {
  sagaId: string;
  correlationId: string;
  steps: Array<{
    name: string;
    execute: () => Promise<void>;
    compensate?: () => Promise<void>;
    metadata?: Record<string, unknown>;
  }>;
}

@Injectable()
export class SagaCoordinatorService {
  private readonly logger = new Logger(SagaCoordinatorService.name);
  private readonly activeSagas: Map<string, SagaState>;

  constructor(
    private readonly compensationHandler: CompensationHandler,
    private readonly retryStrategy: RetryStrategyService,
  ) {
    this.activeSagas = new Map();
  }

  async executeSaga(definition: SagaDefinition): Promise<SagaState> {
    const sagaState = this.initializeSagaState(definition);
    this.activeSagas.set(sagaState.sagaId, sagaState);

    this.logger.log(`Starting saga ${sagaState.sagaId} with ${definition.steps.length} steps`);

    try {
      for (let i = 0; i < definition.steps.length; i++) {
        const step = definition.steps[i];
        const sagaStep = sagaState.steps[i];
        
        await this.executeStep(sagaState, sagaStep, step);
      }

      sagaState.status = SagaStepStatus.COMPLETED;
      sagaState.completedAt = new Date();
      this.logger.log(`Saga ${sagaState.sagaId} completed successfully`);
    } catch (error) {
      await this.handleSagaFailure(sagaState, error as Error);
    }

    return sagaState;
  }

  private initializeSagaState(definition: SagaDefinition): SagaState {
    return {
      sagaId: definition.sagaId || randomUUID(),
      correlationId: definition.correlationId,
      status: SagaStepStatus.PENDING,
      startedAt: new Date(),
      steps: definition.steps.map((step, index) => ({
        stepId: `${definition.sagaId}-step-${index}`,
        name: step.name,
        status: SagaStepStatus.PENDING,
        executeAction: step.execute,
        compensateAction: step.compensate,
        metadata: step.metadata,
      })),
    };
  }

  private async executeStep(
    sagaState: SagaState,
    sagaStep: SagaStep,
    definition: { execute: () => Promise<void> },
  ): Promise<void> {
    sagaStep.status = SagaStepStatus.EXECUTING;
    sagaState.status = SagaStepStatus.EXECUTING;

    this.logger.log(`Executing saga ${sagaState.sagaId} step: ${sagaStep.name}`);

    const shouldRetry = await this.retryStrategy.shouldRetry(
      sagaState.correlationId,
      sagaStep.name,
    );

    if (!shouldRetry) {
      throw new Error(
        `Too many retry attempts for step ${sagaStep.name} in saga ${sagaState.sagaId}`
      );
    }

    await this.retryStrategy.acquireLock(sagaState.correlationId, sagaStep.name);
    
    try {
      await definition.execute();
      sagaStep.status = SagaStepStatus.COMPLETED;
      this.logger.log(`Step ${sagaStep.name} completed successfully`);
    } catch (error) {
      sagaStep.status = SagaStepStatus.FAILED;
      throw error;
    } finally {
      await this.retryStrategy.releaseLock(sagaState.correlationId, sagaStep.name);
    }
  }

  private async handleSagaFailure(sagaState: SagaState, error: Error): Promise<void> {
    this.logger.error(`Saga ${sagaState.sagaId} failed: ${error.message}`);
    sagaState.status = SagaStepStatus.COMPENSATING;
    sagaState.error = error.message;

    const completedSteps = sagaState.steps
      .filter(step => step.status === SagaStepStatus.COMPLETED)
      .reverse();

    for (const step of completedSteps) {
      if (step.compensateAction) {
        await this.compensateStep(sagaState, step);
      }
    }

    sagaState.status = SagaStepStatus.COMPENSATED;
    sagaState.completedAt = new Date();
    
    await this.compensationHandler.recordCompensation(
      sagaState.sagaId,
      sagaState.correlationId,
      error.message,
    );

    this.logger.warn(`Saga ${sagaState.sagaId} compensated`);
  }

  private async compensateStep(sagaState: SagaState, step: SagaStep): Promise<void> {
    if (!step.compensateAction) {
      return;
    }

    this.logger.log(`Compensating step ${step.name} in saga ${sagaState.sagaId}`);
    
    try {
      await step.compensateAction();
      step.status = SagaStepStatus.COMPENSATED;
    } catch (compensateError) {
      this.logger.error(
        `Compensation failed for step ${step.name}: ${compensateError}`
      );
      await this.compensationHandler.recordCompensationFailure(
        sagaState.sagaId,
        step.stepId,
        (compensateError as Error).message,
      );
    }
  }

  getSagaState(sagaId: string): SagaState | undefined {
    return this.activeSagas.get(sagaId);
  }

  getSagaByCorrelationId(correlationId: string): SagaState | undefined {
    for (const saga of this.activeSagas.values()) {
      if (saga.correlationId === correlationId) {
        return saga;
      }
    }
    return undefined;
  }

  getActiveSagas(): SagaState[] {
    return Array.from(this.activeSagas.values());
  }

  async abortSaga(sagaId: string): Promise<SagaState | undefined> {
    const sagaState = this.activeSagas.get(sagaId);
    if (!sagaState) {
      return undefined;
    }

    if (sagaState.status === SagaStepStatus.COMPLETED) {
      throw new Error(`Cannot abort completed saga ${sagaId}`);
    }

    await this.handleSagaFailure(sagaState, new Error('Saga aborted by user'));
    return sagaState;
  }

  async cleanupCompletedSagas(): Promise<number> {
    const completedSagas: string[] = [];
    
    for (const [sagaId, state] of this.activeSagas.entries()) {
      if (
        state.status === SagaStepStatus.COMPLETED ||
        state.status === SagaStepStatus.COMPENSATED
      ) {
        completedSagas.push(sagaId);
      }
    }

    for (const sagaId of completedSagas) {
      this.activeSagas.delete(sagaId);
    }

    return completedSagas.length;
  }
}


// === ARCHIVO: src/infrastructure/saga/compensations/compensation.handler.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';
import { OutboxRepository } from '@infrastructure/outbox/outbox.repository';
import { SQSProducerService } from '@infrastructure/message-brokers/sqs/sqs-producer.service';

export enum CompensationStep {
  REVERT_CREDIT_ORIGINATION = 'REVERT_CREDIT_ORIGINATION',
  MARK_FRAUD_ALERT = 'MARK_FRAUD_ALERT',
  NOTIFY_ORIGINATOR = 'NOTIFY_ORIGINATOR',
  RELEASE_RESERVED_FUNDS = 'RELEASE_RESERVED_FUNDS',
}

export interface CompensationContext {
  readonly sagaId: string;
  readonly correlationId: string;
  readonly stepThatFailed: CompensationStep;
  readonly originalEvent: CreditOriginatedEvent | FraudCheckedEvent;
  readonly failureReason: string;
  readonly timestamp: Date;
}

export interface CompensationResult {
  readonly success: boolean;
  readonly compensationId: string;
  readonly stepsExecuted: CompensationStep[];
  readonly errors: string[];
}

@Injectable()
export class CompensationHandler {
  private readonly logger = new Logger(CompensationHandler.name);

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly sqsProducer: SQSProducerService,
  ) {}

  async handleCompensation(context: CompensationContext): Promise<CompensationResult> {
    const stepsExecuted: CompensationStep[] = [];
    const errors: string[] = [];

    this.logger.warn(
      `Initiating compensation for saga ${context.sagaId} after failure at step ${context.stepThatFailed}`,
    );

    try {
      if (context.originalEvent instanceof CreditOriginatedEvent) {
        const creditId = context.originalEvent.getCreditId();
        
        await this.revertCreditOrigination(creditId, context);
        stepsExecuted.push(CompensationStep.REVERT_CREDIT_ORIGINATION);

        await this.notifyOriginatorOfFailure(creditId, context);
        stepsExecuted.push(CompensationStep.NOTIFY_ORIGINATOR);

        await this.releaseReservedFunds(creditId, context);
        stepsExecuted.push(CompensationStep.RELEASE_RESERVED_FUNDS);
      }

      if (context.originalEvent instanceof FraudCheckedEvent) {
        const fraudCheckId = context.originalEvent.getEventId();
        
        await this.markFraudAlert(fraudCheckId, context);
        stepsExecuted.push(CompensationStep.MARK_FRAUD_ALERT);
      }

      const compensationId = `COMP-${context.sagaId}-${Date.now()}`;
      
      await this.persistCompensationRecord(compensationId, context, stepsExecuted);

      this.logger.log(
        `Compensation completed successfully for saga ${context.sagaId}. Steps executed: ${stepsExecuted.join(', ')}`,
      );

      return {
        success: true,
        compensationId,
        stepsExecuted,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      this.logger.error(
        `Compensation failed for saga ${context.sagaId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        compensationId: `COMP-${context.sagaId}-FAILED`,
        stepsExecuted,
        errors,
      };
    }
  }

  private async revertCreditOrigination(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Reverting credit origination for credit ${creditId}`);
    
    const compensationPayload = {
      action: 'REVERT_CREDIT',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      reason: context.failureReason,
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-${creditId}-${Date.now()}`,
      aggregateType: 'Credit',
      aggregateId: creditId,
      eventType: 'CreditReversedEvent',
      payload: compensationPayload,
      createdAt: new Date(),
      processedAt: null,
    });

    this.logger.debug(`Credit reversal queued for credit ${creditId}`);
  }

  private async markFraudAlert(
    fraudCheckId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Marking fraud alert for check ${fraudCheckId}`);
    
    const fraudAlertPayload = {
      action: 'MARK_FRAUD',
      fraudCheckId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      reason: context.failureReason,
      severity: 'HIGH',
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-FRAUD-${fraudCheckId}-${Date.now()}`,
      aggregateType: 'FraudCheck',
      aggregateId: fraudCheckId,
      eventType: 'FraudAlertMarkedEvent',
      payload: fraudAlertPayload,
      createdAt: new Date(),
      processedAt: null,
    });

    await this.sqsProducer.sendToQueue(
      'fraud-alerts-queue',
      fraudAlertPayload,
      { correlationId: context.correlationId },
    );
  }

  private async notifyOriginatorOfFailure(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Notifying originator of failure for credit ${creditId}`);
    
    const notificationPayload = {
      action: 'NOTIFY_FAILURE',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      message: `Credit origination failed: ${context.failureReason}`,
      timestamp: context.timestamp.toISOString(),
    };

    await this.sqsProducer.sendToQueue(
      'originator-notifications-queue',
      notificationPayload,
      { correlationId: context.correlationId },
    );
  }

  private async releaseReservedFunds(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Releasing reserved funds for credit ${creditId}`);
    
    const releasePayload = {
      action: 'RELEASE_FUNDS',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-FUNDS-${creditId}-${Date.now()}`,
      aggregateType: 'Credit',
      aggregateId: creditId,
      eventType: 'FundsReleasedEvent',
      payload: releasePayload,
      createdAt: new Date(),
      processedAt: null,
    });
  }

  private async persistCompensationRecord(
    compensationId: string,
    context: CompensationContext,
    stepsExecuted: CompensationStep[],
  ): Promise<void> {
    const compensationRecord = {
      id: compensationId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      failedStep: context.stepThatFailed,
      failureReason: context.failureReason,
      executedSteps: stepsExecuted,
      executedAt: new Date(),
      status: 'COMPLETED',
    };

    await this.outboxRepository.save({
      id: compensationId,
      aggregateType: 'SagaCompensation',
      aggregateId: context.sagaId,
      eventType: 'SagaCompensationCompleted',
      payload: compensationRecord,
      createdAt: new Date(),
      processedAt: null,
    });
  }

  async canCompensate(step: CompensationStep): Promise<boolean> {
    const compensableSteps = [
      CompensationStep.REVERT_CREDIT_ORIGINATION,
      CompensationStep.MARK_FRAUD_ALERT,
      CompensationStep.NOTIFY_ORIGINATOR,
      CompensationStep.RELEASE_RESERVED_FUNDS,
    ];
    
    return compensableSteps.includes(step);
  }
}

// === ARCHIVO: src/infrastructure/saga/retries/retry-strategy.service.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { backoff } from 'exponential-backoff';

export interface RetryConfig {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly jitter: 'full' | 'decorrelated' | 'none';
  readonly retryableErrors: ReadonlyArray<string>;
}

export interface RetryContext {
  readonly operationId: string;
  readonly sagaId: string;
  readonly correlationId: string;
  readonly operationType: string;
  readonly attemptNumber: number;
  readonly lastError?: string;
}

export interface RetryResult<T> {
  readonly success: boolean;
  readonly result?: T;
  readonly attempts: number;
  readonly totalTimeMs: number;
  readonly errors: string[];
}

@Injectable()
export class RetryStrategyService {
  private readonly logger = new Logger(RetryStrategyService.name);
  private readonly defaultConfig: RetryConfig;
  private readonly operationConfigs: Map<string, RetryConfig>;

  constructor(private readonly configService: ConfigService) {
    this.defaultConfig = {
      maxAttempts: this.configService.get<number>('saga.retry.maxAttempts', 5),
      initialDelayMs: this.configService.get<number>('saga.retry.initialDelayMs', 1000),
      maxDelayMs: this.configService.get<number>('saga.retry.maxDelayMs', 30000),
      jitter: this.configService.get<'full' | 'decorrelated' | 'none'>('saga.retry.jitter', 'full'),
      retryableErrors: [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'SERVICE_UNAVAILABLE',
        'THROTTLING',
        'RATE_LIMIT_EXCEEDED',
        'TEMPORARY_FAILURE',
      ],
    };

    this.operationConfigs = new Map([
      ['credit-origination', {
        maxAttempts: 3,
        initialDelayMs: 2000,
        maxDelayMs: 15000,
        jitter: 'full',
        retryableErrors: this.defaultConfig.retryableErrors,
      }],
      ['fraud-check', {
        maxAttempts: 4,
        initialDelayMs: 1500,
        maxDelayMs: 20000,
        jitter: 'decorrelated',
        retryableErrors: this.defaultConfig.retryableErrors,
      }],
      ['outbox-persistence', {
        maxAttempts: 5,
        initialDelayMs: 500,
        maxDelayMs: 10000,
        jitter: 'full',
        retryableErrors: [...this.defaultConfig.retryableErrors, 'DYNAMODB_THROTTLING', 'POSTGRESQL_BUSY'],
      }],
      ['message-publish', {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        jitter: 'decorrelated',
        retryableErrors: this.defaultConfig.retryableErrors,
      }],
    ]);
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: RetryContext,
    customConfig?: Partial<RetryConfig>,
  ): Promise<RetryResult<T>> {
    const config = this.resolveConfig(context.operationType, customConfig);
    const errors: string[] = [];
    const startTime = Date.now();

    this.logger.log(
      `Starting retryable operation ${context.operationId} (${context.operationType}) with ${config.maxAttempts} max attempts`,
    );

    try {
      const result = await backoff(
        async () => {
          try {
            return await operation();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isRetryable = this.isRetryableError(errorMessage, config.retryableErrors);

            if (!isRetryable) {
              this.logger.debug(`Non-retryable error in ${context.operationId}: ${errorMessage}`);
              throw error;
            }

            errors.push(`Attempt ${context.attemptNumber}: ${errorMessage}`);
            this.logger.warn(
              `Retryable error at attempt ${context.attemptNumber} for ${context.operationId}: ${errorMessage}`,
            );
            throw error;
          }
        },
        {
          delayGenerator: this.createDelayGenerator(config, context),
          maxAttempts: config.maxAttempts,
          startingDelay: config.initialDelayMs,
          maxDelay: config.maxDelayMs,
          jitter: config.jitter === 'none' ? undefined : config.jitter,
          retry: (err: Error, attemptNumber: number) => {
            context.attemptNumber = attemptNumber;
            context.lastError = err.message;
            return true;
          },
        },
      );

      const totalTimeMs = Date.now() - startTime;
      this.logger.log(
        `Operation ${context.operationId} succeeded after retries. Total time: ${totalTimeMs}ms`,
      );

      return {
        success: true,
        result,
        attempts: context.attemptNumber,
        totalTimeMs,
        errors,
      };
    } catch (error) {
      const totalTimeMs = Date.now() - startTime;
      const finalError = error instanceof Error ? error.message : String(error);
      errors.push(`Final failure: ${finalError}`);

      this.logger.error(
        `Operation ${context.operationId} failed after ${config.maxAttempts} attempts. Total time: ${totalTimeMs}ms`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        attempts: config.maxAttempts,
        totalTimeMs,
        errors,
      };
    }
  }

  private resolveConfig(operationType: string, customConfig?: Partial<RetryConfig>): RetryConfig {
    const specificConfig = this.operationConfigs.get(operationType);
    const baseConfig = specificConfig || this.defaultConfig;

    if (!customConfig) {
      return baseConfig;
    }

    return {
      ...baseConfig,
      ...customConfig,
      retryableErrors: customConfig.retryableErrors || baseConfig.retryableErrors,
    };
  }

  private createDelayGenerator(
    config: RetryConfig,
    context: RetryContext,
  ): (attemptNumber: number, error: Error) => number {
    return (attemptNumber: number, error: Error) => {
      const baseDelay = Math.min(
        config.initialDelayMs * Math.pow(2, attemptNumber - 1),
        config.maxDelayMs,
      );

      let finalDelay = baseDelay;
      if (config.jitter === 'full') {
        finalDelay = baseDelay * (0.5 + Math.random() * 0.5);
      } else if (config.jitter === 'decorrelated') {
        finalDelay = baseDelay * (0.5 + Math.random() * 1.5);
      }

      this.logger.debug(
        `Delay for attempt ${attemptNumber} of ${context.operationId}: ${Math.round(finalDelay)}ms`,
      );

      return Math.round(finalDelay);
    };
  }

  private isRetryableError(error: string, retryableErrors: ReadonlyArray<string>): boolean {
    return retryableErrors.some(retryableError =>
      error.toUpperCase().includes(retryableError.toUpperCase()),
    );
  }

  getConfigForOperation(operationType: string): RetryConfig {
    return this.resolveConfig(operationType);
  }

  isOperationRetryable(operationType: string): boolean {
    return this.operationConfigs.has(operationType) || true;
  }
}

// === ARCHIVO: src/infrastructure/config/aws.config.ts ===
import { ConfigService } from '@nestjs/config';
import { SQSClientConfig } from '@aws-sdk/client-sqs';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

export interface AwsSqsConfig {
  readonly region: string;
  readonly endpoint?: string;
  readonly credentials: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
  readonly queueUrls: {
    readonly creditEvents: string;
    readonly fraudAlerts: string;
    readonly originatorNotifications: string;
    readonly compensationEvents: string;
  };
  readonly fifoQueues: boolean;
  readonly messageDeduplicationIdGeneration: 'content' | 'uuid';
}

export interface AwsDynamoDbConfig {
  readonly region: string;
  readonly endpoint?: string;
  readonly credentials: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
  readonly tableName: string;
  readonly billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
  readonly readCapacityUnits?: number;
  readonly writeCapacityUnits?: number;
  readonly streamSpecification?: {
    readonly streamEnabled: boolean;
    readonly streamViewType: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES';
  };
}

@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {}

  getSqsConfig(): AwsSqsConfig {
    const region = this.configService.get<string>('aws.sqs.region', 'us-east-1');
    const endpoint = this.configService.get<string>('aws.sqs.endpoint');
    const accessKeyId = this.configService.get<string>('aws.credentials.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('aws.credentials.secretAccessKey', '');

    const sqsClientConfig: SQSClientConfig = {
      region,
      ...(endpoint && { endpoint }),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    return {
      ...sqsClientConfig,
      queueUrls: {
        creditEvents: this.configService.get<string>('aws.sqs.queues.creditEvents', ''),
        fraudAlerts: this.configService.get<string>('aws.sqs.queues.fraudAlerts', ''),
        originatorNotifications: this.configService.get<string>('aws.sqs.queues.originatorNotifications', ''),
        compensationEvents: this.configService.get<string>('aws.sqs.queues.compensationEvents', ''),
      },
      fifoQueues: this.configService.get<boolean>('aws.sqs.fifoQueues', false),
      messageDeduplicationIdGeneration: this.configService.get<'content' | 'uuid'>(
        'aws.sqs.messageDeduplicationIdGeneration',
        'uuid',
      ),
    };
  }

  getDynamoDbConfig(): AwsDynamoDbConfig {
    const region = this.configService.get<string>('aws.dynamodb.region', 'us-east-1');
    const endpoint = this.configService.get<string>('aws.dynamodb.endpoint');
    const accessKeyId = this.configService.get<string>('aws.credentials.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('aws.credentials.secretAccessKey', '');

    const dynamoDbClientConfig: DynamoDBClientConfig = {
      region,
      ...(endpoint && { endpoint }),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    return {
      ...dynamoDbClientConfig,
      tableName: this.configService.get<string>('aws.dynamodb.tableName', 'event-outbox'),
      billingMode: this.configService.get<'PAY_PER_REQUEST' | 'PROVISIONED'>(
        'aws.dynamodb.billingMode',
        'PAY_PER_REQUEST',
      ),
      readCapacityUnits: this.configService.get<number>('aws.dynamodb.readCapacityUnits'),
      writeCapacityUnits: this.configService.get<number>('aws.dynamodb.writeCapacityUnits'),
      streamSpecification: this.configService.get<AwsDynamoDbConfig['streamSpecification']>(
        'aws.dynamodb.streamSpecification',
      ),
    };
  }

  getAwsRegion(): string {
    return this.configService.get<string>('aws.region', 'us-east-1');
  }

  isLocalStackEnabled(): boolean {
    return !!this.configService.get<string>('aws.sqs.endpoint') ||
           !!this.configService.get<string>('aws.dynamodb.endpoint');
  }

  getRetryConfig() {
    return {
      maxAttempts: this.configService.get<number>('aws.retry.maxAttempts', 3),
      initialDelayMs: this.configService.get<number>('aws.retry.initialDelayMs', 100),
      maxDelayMs: this.configService.get<number>('aws.retry.maxDelayMs', 5000),
    };
  }
}

/*
 * POLÍTICAS IAM REQUERIDAS (comentadas para referencia en documentación):
 *
 * ============================================
 * POLÍTICA: EventProcessorSQSWrite
 * ============================================
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "sqs:SendMessage",
 *         "sqs:SendMessageBatch",
 *         "sqs:GetQueueUrl",
 *         "sqs:GetQueueAttributes"
 *       ],
 *       "Resource": "arn:aws:sqs:*:*:credit-events-*"
 *     },
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "sqs:ReceiveMessage",
 *         "sqs:DeleteMessage",
 *         "sqs:ChangeMessageVisibility",
 *         "sqs:GetQueueAttributes"
 *       ],
 *       "Resource": "arn:aws:sqs:*:*:credit-events-*"
 *     }
 *   ]
 * }
 *
 * ============================================
 * POLÍTICA: EventProcessorDynamoDBFull
 * ============================================
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "dynamodb:PutItem",
 *         "dynamodb:GetItem",
 *         "dynamodb:UpdateItem",
 *         "dynamodb:DeleteItem",
 *         "dynamodb:Query",
 *         "dynamodb:Scan",
 *         "dynamodb:DescribeTable"
 *       ],
 *       "Resource": "arn:aws:dynamodb:*:*:table/event-outbox"
 *     },
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "dynamodb:ListTables"
 *       ],
 *       "Resource": "*"
 *     }
 *   ]
 * }
 *
 * ============================================
 * POLÍTICA: EventProcessorDynamoDBStreams (opcional)
 * ============================================
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "dynamodb:GetRecords",
 *         "dynamodb:GetShardIterator",
 *         "dynamodb:ListShards"
 *       ],
 *       "Resource": "arn:aws:dynamodb:*:*:table/event-outbox/stream/*"
 *     }
 *   ]
 * }
 *
 * NOTA: Para entornos de producción, considera usar roles IAM en lugar de credenciales estáticas.
 *       Usa IAM Roles for Service Accounts (IRSA) en EKS o Instance Profiles en EC2.
 */


// === ARCHIVO: src/infrastructure/config/kafka.config.ts ===
import { KafkaConfig, ConsumerConfig, ProducerConfig, AdminClientConfig } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

export interface KafkaBootstrapConfig {
  readonly brokers: string[];
  readonly clientId: string;
  readonly ssl: boolean;
  readonly sasl?: {
    readonly mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    readonly username: string;
    readonly password: string;
  };
}

export interface KafkaConsumerGroupConfig {
  readonly groupId: string;
  readonly sessionTimeoutMs: number;
  readonly heartbeatIntervalMs: number;
  readonly rebalanceTimeoutMs: number;
  readonly maxWaitTimeInMs: number;
  readonly minBytes: number;
  readonly maxBytes: number;
  readonly maxBytesPerPartition: number;
}

export interface KafkaExactlyOnceConfig {
  readonly enableIdempotence: boolean;
  readonly transactionTimeoutMs: number;
  readonly isolationLevel: 'read_uncommitted' | 'read_committed';
  readonly maxInFlightRequests: number;
  readonly retryTimeoutMs: number;
}

export interface KafkaTopicConfig {
  readonly topics: Array<{
    readonly name: string;
    readonly numPartitions: number;
    readonly replicationFactor: number;
    readonly retentionMs: number;
    readonly retentionBytes: number;
    readonly segmentMs: number;
    readonly segmentBytes: number;
    readonly maxMessageBytes: number;
    readonly compressionType: 'gzip' | 'snappy' | 'lz4' | 'zstd';
  }>;
}

export class KafkaConfigurationService {
  private readonly configService: ConfigService;
  private readonly environment: string;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.environment = this.configService.get<string>('NODE_ENV', 'development');
  }

  getBootstrapConfig(): KafkaBootstrapConfig {
    const brokersString = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092');
    const brokers = brokersString.split(',').map(b => b.trim());
    const ssl = this.environment !== 'development';

    const saslUsername = this.configService.get<string>('KAFKA_SASL_USERNAME');
    const saslPassword = this.configService.get<string>('KAFKA_SASL_PASSWORD');

    let sasl: KafkaBootstrapConfig['sasl'] | undefined;
    if (saslUsername && saslPassword) {
      sasl = {
        mechanism: 'scram-sha-512',
        username: saslUsername,
        password: saslPassword,
      };
    }

    return {
      brokers,
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'credit-processing-service'),
      ssl,
      sasl,
    };
  }

  getProducerConfig(): ProducerConfig {
    const bootstrapConfig = this.getBootstrapConfig();
    const exactlyOnceConfig = this.getExactlyOnceConfig();

    return {
      clientId: bootstrapConfig.clientId,
      brokers: bootstrapConfig.brokers,
      ssl: bootstrapConfig.ssl ? { rejectUnauthorized: false } : false,
      sasl: bootstrapConfig.sasl,
      allowAutoCreateTopics: false,
      enableIdempotence: exactlyOnceConfig.enableIdempotence,
      maxInFlightRequests: exactlyOnceConfig.maxInFlightRequests,
      transactionTimeoutMs: exactlyOnceConfig.transactionTimeoutMs,
      retry: {
        initialRetryTime: 100,
        retries: 8,
        factor: 2,
        maxRetryTime: 30000,
      },
    };
  }

  getConsumerConfig(groupSuffix: string = 'default'): KafkaConsumerGroupConfig {
    const baseGroupId = this.configService.get<string>('KAFKA_CONSUMER_GROUP', 'credit-processing-group');

    return {
      groupId: `${baseGroupId}-${groupSuffix}`,
      sessionTimeoutMs: 45000,
      heartbeatIntervalMs: 3000,
      rebalanceTimeoutMs: 60000,
      maxWaitTimeInMs: 5000,
      minBytes: 1,
      maxBytes: 10485760,
      maxBytesPerPartition: 1048576,
    };
  }

  getExactlyOnceConfig(): KafkaExactlyOnceConfig {
    const enableIdempotence = this.configService.get<boolean>('KAFKA_ENABLE_IDEMPOTENCE', true);

    return {
      enableIdempotence,
      transactionTimeoutMs: this.configService.get<number>('KAFKA_TRANSACTION_TIMEOUT_MS', 60000),
      isolationLevel: this.configService.get<'read_uncommitted' | 'read_committed'>(
        'KAFKA_ISOLATION_LEVEL',
        'read_committed'
      ),
      maxInFlightRequests: enableIdempotence ? 5 : 100,
      retryTimeoutMs: this.configService.get<number>('KAFKA_RETRY_TIMEOUT_MS', 30000),
    };
  }

  getTopicConfig(): KafkaTopicConfig {
    return {
      topics: [
        {
          name: this.configService.get<string>('KAFKA_TOPIC_CREDIT_ORIGINATED', 'credit.originated'),
          numPartitions: this.configService.get<number>('KAFKA_TOPIC_CREDIT_PARTITIONS', 12),
          replicationFactor: this.configService.get<number>('KAFKA_TOPIC_REPLICATION_FACTOR', 3),
          retentionMs: 604800000,
          retentionBytes: -1,
          segmentMs: 604800000,
          segmentBytes: 1073741824,
          maxMessageBytes: 1048588,
          compressionType: 'zstd',
        },
        {
          name: this.configService.get<string>('KAFKA_TOPIC_FRAUD_CHECKED', 'fraud.checked'),
          numPartitions: this.configService.get<number>('KAFKA_TOPIC_FRAUD_PARTITIONS', 12),
          replicationFactor: this.configService.get<number>('KAFKA_TOPIC_REPLICATION_FACTOR', 3),
          retentionMs: 259200000,
          retentionBytes: -1,
          segmentMs: 604800000,
          segmentBytes: 1073741824,
          maxMessageBytes: 1048588,
          compressionType: 'zstd',
        },
        {
          name: this.configService.get<string>('KAFKA_TOPIC_SAGA_EVENTS', 'saga.events'),
          numPartitions: this.configService.get<number>('KAFKA_TOPIC_SAGA_PARTITIONS', 6),
          replicationFactor: this.configService.get<number>('KAFKA_TOPIC_REPLICATION_FACTOR', 3),
          retentionMs: 86400000,
          retentionBytes: -1,
          segmentMs: 86400000,
          segmentBytes: 536870912,
          maxMessageBytes: 1048588,
          compressionType: 'zstd',
        },
      ],
    };
  }

  createKafkaConfig(): KafkaConfig {
    const bootstrapConfig = this.getBootstrapConfig();
    const exactlyOnceConfig = this.getExactlyOnceConfig();

    return {
      clientId: bootstrapConfig.clientId,
      brokers: bootstrapConfig.brokers,
      ssl: bootstrapConfig.ssl ? { rejectUnauthorized: false } : false,
      sasl: bootstrapConfig.sasl,
      connectionTimeout: 10000,
      authenticationTimeout: 10000,
      reauthenticationThreshold: 10000,
      enforceSslPrefixMatch: true,
    };
  }

  createAdminConfig(): AdminClientConfig {
    const bootstrapConfig = this.getBootstrapConfig();

    return {
      clientId: `${bootstrapConfig.clientId}-admin`,
      brokers: bootstrapConfig.brokers,
      ssl: bootstrapConfig.ssl ? { rejectUnauthorized: false } : false,
      sasl: bootstrapConfig.sasl,
    };
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }

  getSecurityConfig(): { sslEndpointIdentificationAlgorithm: 'https' | 'none'; sslCertificateLocation?: string } {
    if (this.isProduction()) {
      return { sslEndpointIdentificationAlgorithm: 'https' };
    }
    return { sslEndpointIdentificationAlgorithm: 'none' };
  }
}

export const KAFKA_CONFIG_TOKEN = 'KAFKA_CONFIG';

export const createKafkaConfigurationProvider = {
  provide: KAFKA_CONFIG_TOKEN,
  useFactory: (configService: ConfigService): KafkaConfigurationService => {
    return new KafkaConfigurationService(configService);
  },
  inject: [ConfigService],
};

// === ARCHIVO: src/infrastructure/db/dynamodb/dynamodb.client.ts ===
import { DynamoDBClient, DynamoDBClientConfig, ListTablesCommand, DescribeLimitsCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand, BatchWriteCommand, DynamoDBDocumentClientConfig } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

export interface DynamoDBThroughputConfig {
  readonly readCapacityUnits: number;
  readonly writeCapacityUnits: number;
  readonly maxReadCapacityUnits: number;
  readonly maxWriteCapacityUnits: number;
  readonly targetUtilizationPercentage: number;
}

export interface DynamoDBBackpressureConfig {
  readonly enabled: boolean;
  readonly maxPendingRequests: number;
  readonly backoffDelayMs: number;
  readonly maxRetries: number;
  readonly circuitBreakerThreshold: number;
  readonly circuitBreakerTimeoutMs: number;
}

export interface DynamoDBClientMetrics {
  readonly consumedReadCapacityUnits: number;
  readonly consumedWriteCapacityUnits: number;
  readonly throttledReadRequests: number;
  readonly throttledWriteRequests: number;
  readonly totalRequests: number;
  readonly failedRequests: number;
}

class ThroughputTracker {
  private readCapacityUsed = 0;
  private writeCapacityUsed = 0;
  private throttledReads = 0;
  private throttledWrites = 0;
  private totalRequests = 0;
  private failedRequests = 0;
  private lastResetAt = Date.now();
  private readonly windowSizeMs = 60000;

  recordRead(capacityUnits: number, throttled: boolean = false): void {
    this.readCapacityUsed += capacityUnits;
    this.totalRequests++;
    if (throttled) this.throttledReads++;
    this.checkWindowReset();
  }

  recordWrite(capacityUnits: number, throttled: boolean = false): void {
    this.writeCapacityUsed += capacityUnits;
    this.totalRequests++;
    if (throttled) this.throttledWrites++;
    this.checkWindowReset();
  }

  recordFailure(): void {
    this.failedRequests++;
    this.totalRequests++;
  }

  getMetrics(): DynamoDBClientMetrics {
    return {
      consumedReadCapacityUnits: this.readCapacityUsed,
      consumedWriteCapacityUnits: this.writeCapacityUsed,
      throttledReadRequests: this.throttledReads,
      throttledWriteRequests: this.throttledWrites,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
    };
  }

  private checkWindowReset(): void {
    const now = Date.now();
    if (now - this.lastResetAt >= this.windowSizeMs) {
      this.readCapacityUsed = 0;
      this.writeCapacityUsed = 0;
      this.throttledReads = 0;
      this.throttledWrites = 0;
      this.totalRequests = 0;
      this.failedRequests = 0;
      this.lastResetAt = now;
    }
  }
}

export class DynamoDBClientWrapper {
  private readonly client: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;
  private readonly configService: ConfigService;
  private readonly throughputConfig: DynamoDBThroughputConfig;
  private readonly backpressureConfig: DynamoDBBackpressureConfig;
  private readonly throughputTracker: ThroughputTracker;
  private pendingRequests = 0;
  private circuitOpen = false;
  private circuitOpenedAt = 0;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.throughputTracker = new ThroughputTracker();

    const clientConfig = this.createClientConfig();
    this.client = new DynamoDBClient(clientConfig);

    const documentClientConfig = this.createDocumentClientConfig();
    this.docClient = DynamoDBDocumentClient.from(this.client, documentClientConfig);

    this.throughputConfig = this.getThroughputConfig();
    this.backpressureConfig = this.getBackpressureConfig();
  }

  private createClientConfig(): DynamoDBClientConfig {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');
    const credentials = this.configService.get<{ accessKeyId: string; secretAccessKey: string }>('AWS_CREDENTIALS');

    const config: DynamoDBClientConfig = {
      region,
      maxAttempts: 5,
      retryMode: 'adaptive',
      timeout: 30000,
    };

    if (endpoint) {
      config.endpoint = endpoint;
    }

    if (credentials) {
      config.credentials = credentials;
    }

    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      config.tls = false;
    }

    return config;
  }

  private createDocumentClientConfig(): DynamoDBDocumentClientConfig {
    const marshallOptions = {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
      convertTopLevelContainer: true,
    };

    const unmarshallOptions = {
      wrapNumbers: false,
    };

    return {
      marshallOptions,
      unmarshallOptions,
    };
  }

  private getThroughputConfig(): DynamoDBThroughputConfig {
    return {
      readCapacityUnits: this.configService.get<number>('DYNAMODB_READ_CAPACITY', 10),
      writeCapacityUnits: this.configService.get<number>('DYNAMODB_WRITE_CAPACITY', 10),
      maxReadCapacityUnits: this.configService.get<number>('DYNAMODB_MAX_READ_CAPACITY', 100),
      maxWriteCapacityUnits: this.configService.get<number>('DYNAMODB_MAX_WRITE_CAPACITY', 100),
      targetUtilizationPercentage: this.configService.get<number>('DYNAMODB_TARGET_UTILIZATION', 70),
    };
  }

  private getBackpressureConfig(): DynamoDBBackpressureConfig {
    return {
      enabled: this.configService.get<boolean>('DYNAMODB_BACKPRESSURE_ENABLED', true),
      maxPendingRequests: this.configService.get<number>('DYNAMODB_MAX_PENDING_REQUESTS', 100),
      backoffDelayMs: this.configService.get<number>('DYNAMODB_BACKOFF_DELAY_MS', 100),
      maxRetries: this.configService.get<number>('DYNAMODB_MAX_RETRIES', 3),
      circuitBreakerThreshold: this.configService.get<number>('DYNAMODB_CIRCUIT_BREAKER_THRESHOLD', 50),
      circuitBreakerTimeoutMs: this.configService.get<number>('DYNAMODB_CIRCUIT_BREAKER_TIMEOUT_MS', 60000),
    };
  }

  private async applyBackpressure(): Promise<void> {
    if (!this.backpressureConfig.enabled) return;

    while (this.pendingRequests >= this.backpressureConfig.maxPendingRequests) {
      if (this.circuitOpen) {
        const timeSinceOpen = Date.now() - this.circuitOpenedAt;
        if (timeSinceOpen < this.backpressureConfig.circuitBreakerTimeoutMs) {
          await this.sleep(this.backpressureConfig.backoffDelayMs * 2);
          continue;
        } else {
          this.circuitOpen = false;
        }
      }
      await this.sleep(this.backpressureConfig.backoffDelayMs);
    }
  }

  private async trackRequest<T>(operation: () => Promise<T>): Promise<T> {
    this.pendingRequests++;
    try {
      const result = await operation();
      return result;
    } catch (error) {
      this.throughputTracker.recordFailure();
      this.checkCircuitBreaker(error);
      throw error;
    } finally {
      this.pendingRequests--;
    }
  }

  private checkCircuitBreaker(error: unknown): void {
    const metrics = this.throughputTracker.getMetrics();
    const errorRate = metrics.totalRequests > 0 
      ? (metrics.failedRequests / metrics.totalRequests) * 100 
      : 0;

    if (errorRate >= this.backpressureConfig.circuitBreakerThreshold && !this.circuitOpen) {
      this.circuitOpen = true;
      this.circuitOpenedAt = Date.now();
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async put(params: {
    tableName: string;
    item: Record<string, unknown>;
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, unknown>;
  }): Promise<void> {
    await this.applyBackpressure();

    const estimatedCapacity = 1;
    this.throughputTracker.recordWrite(estimatedCapacity);

    await this.trackRequest(async () => {
      const command = new PutCommand({
        TableName: params.tableName,
        Item: params.item,
        ConditionExpression: params.conditionExpression,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ReturnValues: 'NONE',
      });

      await this.docClient.send(command);
    });
  }

  async get(params: {
    tableName: string;
    key: Record<string, unknown>;
    projectionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
  }): Promise<Record<string, unknown> | null> {
    await this.applyBackpressure();

    const estimatedCapacity = 1;
    this.throughputTracker.recordRead(estimatedCapacity);

    return this.trackRequest(async () => {
      const command = new GetCommand({
        TableName: params.tableName,
        Key: params.key,
        ProjectionExpression: params.projectionExpression,
        ExpressionAttributeNames: params.expressionAttributeNames,
      });

      const response = await this.docClient.send(command);
      return response.Item || null;
    });
  }

  async update(params: {
    tableName: string;
    key: Record<string, unknown>;
    updateExpression: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, unknown>;
    conditionExpression?: string;
    returnValues?: 'ALL_NEW' | 'ALL_OLD' | 'UPDATED_NEW' | 'UPDATED_OLD' | 'NONE';
  }): Promise<Record<string, unknown> | null> {
    await this.applyBackpressure();

    const estimatedCapacity = 1;
    this.throughputTracker.recordWrite(estimatedCapacity);

    return this.trackRequest(async () => {
      const command = new UpdateCommand({
        TableName: params.tableName,
        Key: params.key,
        UpdateExpression: params.updateExpression,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ConditionExpression: params.conditionExpression,
        ReturnValues: params.returnValues || 'ALL_NEW',
      });

      const response = await this.docClient.send(command);
      return response.Attributes || null;
    });
  }

  async delete(params: {
    tableName: string;
    key: Record<string, unknown>;
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, unknown>;
  }): Promise<void> {
    await this.applyBackpressure();

    const estimatedCapacity = 1;
    this.throughputTracker.recordWrite(estimatedCapacity);

    await this.trackRequest(async () => {
      const command = new DeleteCommand({
        TableName: params.tableName,
        Key: params.key,
        ConditionExpression: params.conditionExpression,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ExpressionAttributeValues: params.expressionAttributeValues,
      });

      await this.docClient.send(command);
    });
  }

  async query(params: {
    tableName: string;
    keyConditionExpression: string;
    expressionAttributeValues: Record<string, unknown>;
    expressionAttributeNames?: Record<string, string>;
    projectionExpression?: string;
    filterExpression?: string;
    indexName?: string;
    scanIndexForward?: boolean;
    limit?: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Record<string, unknown>[]; lastEvaluatedKey?: Record<string, unknown> }> {
    await this.applyBackpressure();

    const estimatedCapacity = params.limit || 1;
    this.throughputTracker.recordRead(estimatedCapacity);

    return this.trackRequest(async () => {
      const command = new QueryCommand({
        TableName: params.tableName,
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ProjectionExpression: params.projectionExpression,
        FilterExpression: params.filterExpression,
        IndexName: params.indexName,
        ScanIndexForward: params.scanIndexForward ?? true,
        Limit: params.limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });

      const response = await this.docClient.send(command);
      return {
        items: response.Items || [],
        lastEvaluatedKey: response.LastEvaluatedKey,
      };
    });
  }

  async batchWrite(params: {
    tableName: string;
    items: Array<{ put?: Record<string, unknown>; delete?: Record<string, unknown> }>;
  }): Promise<void> {
    await this.applyBackpressure();

    const estimatedCapacity = params.items.length;
    this.throughputTracker.recordWrite(estimatedCapacity);

    await this.trackRequest(async () => {
      const requestItems: Record<string, Array<{ PutRequest?: { Item: Record<string, unknown> }; DeleteRequest?: { Key: Record<string, unknown> } }>> = {};
      requestItems[params.tableName] = params.items.map(item => {
        if (item.put) {
          return { PutRequest: { Item: item.put } };
        } else if (item.delete) {
          return { DeleteRequest: { Key: item.delete } };
        }
        throw new Error('Invalid batch item');
      });

      const command = new BatchWriteCommand({
        RequestItems: requestItems,
        ReturnConsumedCapacity: 'TOTAL',
      });

      await this.docClient.send(command);
    });
  }

  getMetrics(): DynamoDBClientMetrics {
    return this.throughputTracker.getMetrics();
  }

  isCircuitOpen(): boolean {
    if (!this.circuitOpen) return false;

    const timeSinceOpen = Date.now() - this.circuitOpenedAt;
    if (timeSinceOpen >= this.backpressureConfig.circuitBreakerTimeoutMs) {
      this.circuitOpen = false;
      return false;
    }

    return true;
  }

  getThroughputConfig(): Readonly<DynamoDBThroughputConfig> {
    return this.throughputConfig;
  }

  getBackpressureConfig(): Readonly<DynamoDBBackpressureConfig> {
    return this.backpressureConfig;
  }

  getClient(): DynamoDBClient {
    return this.client;
  }

  getDocumentClient(): DynamoDBDocumentClient {
    return this.docClient;
  }
}

export const DYNAMODB_CLIENT_TOKEN = 'DYNAMODB_CLIENT';

export const createDynamoDBClientProvider = {
  provide: DYNAMODB_CLIENT_TOKEN,
  useFactory: (configService: ConfigService): DynamoDBClientWrapper => {
    return new DynamoDBClientWrapper(configService);
  },
  inject: [ConfigService],
};

// === ARCHIVO: src/infrastructure/db/postgresql/postgresql.client.ts ===
import { Pool, PoolConfig, PoolClient, QueryResult, QueryConfig, DatabaseError } from 'pg';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

export interface PostgreSQLConnectionConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
  readonly ssl: boolean;
  readonly sslMode?: 'disable' | 'require' | 'verify-ca' | 'verify-full';
  readonly applicationName: string;
}

export interface PostgreSQLPoolConfig {
  readonly max: number;
  readonly min: number;
  readonly idleTimeoutMillis: number;
  readonly connectionTimeoutMillis: number;
  readonly statementTimeoutMillis: number;
  readonly queryTimeoutMillis: number;
  readonly idleTransactionTimeoutSeconds: number;
  readonly maxLifetimeSeconds: number;
}

export interface PostgreSQLTransactionConfig {
  readonly isolationLevel: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  readonly deferrable: boolean;
  readonly readOnly: boolean;
}

export interface PostgreSQLClientMetrics {
  readonly totalConnections: number;
  readonly idleConnections: number;
  readonly waitingClients: number;
  readonly activeQueries: number;
  readonly executedQueries: number;
  readonly failedQueries: number;
  readonly averageQueryDurationMs: number;
  readonly longestQueryDurationMs: number;
}

class QueryMetricsCollector {
  private executedQueries = 0;
  private failedQueries = 0;
  private totalDurationMs = 0;
  private longestDurationMs = 0;
  private queryDurations: number[] = [];
  private readonly maxSamples = 1000;

  recordSuccess(durationMs: number): void {
    this.executedQueries++;
    this.totalDurationMs += durationMs;
    this.queryDurations.push(durationMs);

    if (durationMs > this.longestDurationMs) {
      this.longestDurationMs = durationMs;
    }

    if (this.queryDurations.length > this.maxSamples) {
      this.queryDurations.shift();
    }
  }

  recordFailure(): void {
    this.failedQueries++;
  }

  getMetrics(): Pick<PostgreSQLClientMetrics, 'executedQueries' | 'failedQueries' | 'averageQueryDurationMs' | 'longestQueryDurationMs'> {
    const averageDuration = this.queryDurations.length > 0
      ? this.totalDurationMs / this.queryDurations.length
      : 0;

    return {
      executedQueries: this.executedQueries,
      failedQueries: this.failedQueries,
      averageQueryDurationMs: Math.round(averageDuration),
      longestQueryDurationMs: Math.round(this.longestDurationMs),
    };
  }

  reset(): void {
    this.executedQueries = 0;
    this.failedQueries = 0;
    this.totalDurationMs = 0;
    this.longestDurationMs = 0;
    this.queryDurations = [];
  }
}

export class PostgreSQLClientWrapper extends EventEmitter {
  private readonly pool: Pool;
  private readonly configService: ConfigService;
  private readonly metricsCollector: QueryMetricsCollector;
  private readonly poolConfig: PostgreSQLPoolConfig;
  private isHealthy = true;
  private lastHealthCheck = Date.now();

  constructor(configService: ConfigService) {
    super();
    this.configService = configService;
    this.metricsCollector = new QueryMetricsCollector();
    this.poolConfig = this.getPoolConfig();

    const connectionConfig = this.getConnectionConfig();
    const poolConfig: PoolConfig = {
      ...connectionConfig,
      max: this.poolConfig.max,
      min: this.poolConfig.min,
      idleTimeoutMillis: this.poolConfig.idleTimeoutMillis,
      connectionTimeoutMillis: this.poolConfig.connectionTimeoutMillis,
      statement_timeout: this.poolConfig.statementTimeoutMillis,
      query_timeout: this.poolConfig.queryTimeoutMillis,
      idle_in_transaction_session_timeout: this.poolConfig.idleTransactionTimeoutSeconds * 1000,
      max_lifetime: this.poolConfig.maxLifetimeSeconds * 1000,
      application_name: connectionConfig.applicationName,
    };

    this.pool = new Pool(poolConfig);

    this.setupPoolEventHandlers();
  }

  private getConnectionConfig(): PostgreSQLConnectionConfig {
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    return {
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: this.configService.get<number>('POSTGRES_PORT', 5432),
      database: this.configService.get<string>('POSTGRES_DATABASE', 'credit_processing'),
      user: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      ssl: environment === 'production',
      sslMode: environment === 'production' ? 'require' : 'disable',
      applicationName: 'credit-processing-service',
    };
  }

  private getPoolConfig(): PostgreSQLPoolConfig {
    return {
      max: this.configService.get<number>('POSTGRES_POOL_MAX', 20),
      min: this.configService.get<number>('POSTGRES_POOL_MIN', 5),
      idleTimeoutMillis: this.configService.get<number>('POSTGRES_IDLE_TIMEOUT_MS', 30000),
      connectionTimeoutMillis: this.configService.get<number>('POSTGRES_CONNECTION_TIMEOUT_MS', 10000),
      statementTimeoutMillis: this.configService.get<number>('POSTGRES_STATEMENT_TIMEOUT_MS', 30000),
      queryTimeoutMillis: this.configService.get<number>('POSTGRES_QUERY_TIMEOUT_MS', 30000),
      idleTransactionTimeoutSeconds: this.configService.get<number>('POSTGRES_IDLE_TRANSACTION_TIMEOUT_SEC', 30),
      maxLifetimeSeconds: this.configService.get<number>('POSTGRES_MAX_LIFETIME_SEC', 1800),
    };
  }

  private setupPoolEventHandlers(): void {
    this.pool.on('error', (err: Error) => {
      this.emit('error', err);
      this.isHealthy = false;
    });

    this.pool.on('connect', (client: PoolClient) => {
      this.emit('connect', client);
    });

    this.pool.on('acquire', (client: PoolClient) => {
      this.emit('acquire', client);
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.emit('remove', client);
    });
  }

  async query<T = Record<string, unknown>>(
    text: string,
    values?: unknown[],
    config?: Partial<QueryConfig>
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await this.pool.query<T>({
        text,
        values,
        ...config,
      });

      const durationMs = Date.now() - startTime;
      this.metricsCollector.recordSuccess(durationMs);

      return result;
    } catch (error) {
      this.metricsCollector.recordFailure();
      this.handleQueryError(error, text, values);
      throw error;
    }
  }

  async queryWithRetry<T = Record<string, unknown>>(
    text: string,
    values?: unknown[],
    maxRetries: number = 3,
    retryDelayMs: number = 1000
  ): Promise<QueryResult<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.query<T>(text, values);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = retryDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof DatabaseError) {
      const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'HY000'];
      return retryableCodes.includes(error.code || '') || error.code?.startsWith('08') === true;
    }
    return false;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    transactionConfig?: Partial<PostgreSQLTransactionConfig>
  ): Promise<T> {
    const config: PostgreSQLTransactionConfig = {
      isolationLevel: transactionConfig?.isolationLevel || 'READ COMMITTED',
      deferrable: transactionConfig?.deferrable || false,
      readOnly: transactionConfig?.readOnly || false,
    };

    const client = await this.getClient();

    try {
      await client.query(`BEGIN ISOLATION LEVEL ${config.isolationLevel}`);

      if (config.deferrable) {
        await client.query('SET CONSTRAINTS ALL DEFERRED');
      }

      if (config.readOnly) {
        await client.query('SET TRANSACTION READ ONLY');
      }

      const result = await callback(client);

      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async withSavepoint<T>(
    savepointName: string,
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query(`SAVEPOINT ${savepointName}`);

      const result = await callback(client);

      await client.query(`RELEASE SAVEPOINT ${savepointName}`);

      return result;
    } catch (error) {
      await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      throw error;
    } finally {
      client.release();
    }
  }

  async executeInTransaction<T>(
    operations: Array<{ sql: string; values?: unknown[] }>
  ): Promise<T[]> {
    return this.withTransaction(async (client: PoolClient) => {
      const results: T[] = [];

      for (const operation of operations) {
        const result = await client.query<T>(operation.sql, operation.values);
        results.push(result.rows as T);
      }

      return results;
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1 as health_check');
      this.isHealthy = result.rows[0]?.health_check === 1;
      this.lastHealthCheck = Date.now();
      return this.isHealthy;
    } catch {
      this.isHealthy = false;
      return false;
    }
  }

  async checkConnection(): Promise<{ connected: boolean; latencyMs: number }> {
    const startTime = Date.now();

    try {
      await this.pool.query('SELECT 1');
      const latencyMs = Date.now() - startTime;

      return { connected: true, latencyMs };
    } catch {
      return { connected: false, latencyMs: -1 };
    }
  }

  getMetrics(): PostgreSQLClientMetrics {
    const poolMetrics = this.pool;

    return {
      totalConnections: poolMetrics.totalCount,
      idleConnections: poolMetrics.idleCount,
      waitingClients: poolMetrics.waitingCount,
      activeQueries: poolMetrics.totalCount - poolMetrics.idleCount,
      ...this.metricsCollector.getMetrics(),
    };
  }

  isHealthyState(): boolean {
    return this.isHealthy;
  }

  getLastHealthCheck(): Date {
    return new Date(this.lastHealthCheck);
  }

  getPoolConfig(): Readonly<PostgreSQLPoolConfig> {
    return this.poolConfig;
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  private handleQueryError(error: unknown, text: string, values?: unknown[]): void {
    if (error instanceof DatabaseError) {
      this.emit('queryError', {
        error,
        query: text,
        values,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
      });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const POSTGRES_CLIENT_TOKEN = 'POSTGRES_CLIENT';

export const createPostgreSQLClientProvider = {
  provide: POSTGRES_CLIENT_TOKEN,
  useFactory: (configService: ConfigService): PostgreSQLClientWrapper => {
    return new PostgreSQLClientWrapper(configService);
  },
  inject: [ConfigService],
};


// === ARCHIVO: src/interfaces/http/credit.controller.ts ===
import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Logger, Inject } from '@nestjs/common';
import { CreateCreditRequestDTO } from '@application/dto/create-credit-request.dto';
import { ProcessCreditUseCase } from '@application/use-cases/process-credit.usecase';
import { EventPublisherService } from '@application/services/event-publisher.service';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { CreditApplicant, CreditDetails } from '@domain/events/credit-originated.event';

@Controller('credits')
export class CreditController {
  private readonly logger = new Logger(CreditController.name);

  constructor(
    private readonly processCreditUseCase: ProcessCreditUseCase,
    private readonly eventPublisherService: EventPublisherService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async initiateCreditProcessing(@Body() request: CreateCreditRequestDTO): Promise<{ creditId: string; status: string }> {
    this.logger.log(`Received credit processing request for applicant: ${request.applicantId}`);

    try {
      const creditDetails: CreditDetails = {
        creditId: request.creditId,
        amount: request.amount,
        currency: request.currency || 'BRL',
        termMonths: request.termMonths,
        interestRate: request.interestRate,
        purpose: request.purpose,
        installmentAmount: this.calculateInstallmentAmount(
          request.amount,
          request.termMonths,
          request.interestRate
        ),
        firstPaymentDate: request.firstPaymentDate,
      };

      const applicant: CreditApplicant = {
        applicantId: request.applicantId,
        fullName: request.fullName,
        email: request.email,
        documentType: request.documentType,
        documentNumber: request.documentNumber,
        monthlyIncome: request.monthlyIncome,
        creditScore: request.creditScore,
      };

      const event = CreditOriginatedEvent.create({
        credit: creditDetails,
        applicant,
        originators: [request.originatorId],
        approvedBy: 'credit-system',
        channel: 'http-api',
      });

      await this.eventPublisherService.publishCreditOriginatedEvent(event);

      this.logger.log(`Credit processing initiated for creditId: ${request.creditId}, eventId: ${event.getEventId()}`);

      return {
        creditId: request.creditId,
        status: 'PROCESSING',
      };
    } catch (error) {
      this.logger.error(`Failed to initiate credit processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':creditId')
  async getCreditStatus(@Param('creditId') creditId: string): Promise<{ creditId: string; status: string }> {
    this.logger.log(`Fetching status for creditId: ${creditId}`);
    
    return {
      creditId,
      status: 'PROCESSING',
    };
  }

  private calculateInstallmentAmount(amount: number, termMonths: number, annualInterestRate: number): number {
    const monthlyRate = annualInterestRate / 12 / 100;
    if (monthlyRate === 0) {
      return amount / termMonths;
    }
    const factor = Math.pow(1 + monthlyRate, termMonths);
    return (amount * monthlyRate * factor) / (factor - 1);
  }
}

// === ARCHIVO: src/interfaces/messaging/event-subscriber.ts ===
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MessageBroker, MessageBrokerMessage } from '@infrastructure/message-brokers/message-broker.interface';
import { SagaCoordinatorService } from '@infrastructure/saga/saga-coordinator.service';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';

const CREDIT_ORIGINATED_TOPIC = 'credit.originated';
const FRAUD_CHECKED_TOPIC = 'fraud.checked';

@Injectable()
export class EventSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventSubscriber.name);
  private isConsuming = false;

  constructor(
    private readonly messageBroker: MessageBroker,
    private readonly sagaCoordinator: SagaCoordinatorService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing event subscriber...');
    await this.subscribeToTopics();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down event subscriber...');
    this.isConsuming = false;
  }

  private async subscribeToTopics(): Promise<void> {
    try {
      await this.messageBroker.subscribe(
        CREDIT_ORIGINATED_TOPIC,
        this.handleCreditOriginatedEvent.bind(this)
      );

      await this.messageBroker.subscribe(
        FRAUD_CHECKED_TOPIC,
        this.handleFraudCheckedEvent.bind(this)
      );

      this.isConsuming = true;
      this.logger.log(`Subscribed to topics: ${CREDIT_ORIGINATED_TOPIC}, ${FRAUD_CHECKED_TOPIC}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleCreditOriginatedEvent(message: MessageBrokerMessage): Promise<void> {
    const { eventId, correlationId, payload } = message;

    this.logger.log(
      `Processing CreditOriginatedEvent: eventId=${eventId}, correlationId=${correlationId}`
    );

    try {
      const event = CreditOriginatedEvent.fromPayload(payload);

      const sagaExecutionId = await this.sagaCoordinator.startSaga({
        sagaType: 'credit-processing',
        correlationId: event.getCorrelationId(),
        payload: {
          creditId: event.getCreditId(),
          applicantId: event.getApplicantId(),
          amount: event.getAmount(),
          purpose: event.getPurpose(),
          eventId: event.getEventId(),
        },
        compensationActions: [
          {
            stepName: 'fraud-check',
            compensate: async () => {
              this.logger.warn(`Compensating fraud check for credit: ${event.getCreditId()}`);
            },
          },
          {
            stepName: 'credit-origination',
            compensate: async () => {
              this.logger.warn(`Compensating credit origination for credit: ${event.getCreditId()}`);
            },
          },
        ],
      });

      this.logger.log(
        `Saga initiated for credit processing: sagaExecutionId=${sagaExecutionId}, creditId=${event.getCreditId()}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to process CreditOriginatedEvent: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async handleFraudCheckedEvent(message: MessageBrokerMessage): Promise<void> {
    const { eventId, correlationId, payload } = message;

    this.logger.log(
      `Processing FraudCheckedEvent: eventId=${eventId}, correlationId=${correlationId}`
    );

    try {
      const event = FraudCheckedEvent.fromPayload(payload);

      if (event.isApproved()) {
        this.logger.log(
          `Fraud check approved for credit: ${event.getCreditId()}, proceeding with saga`
        );
        await this.sagaCoordinator.processStep({
          stepName: 'fraud-check',
          correlationId: event.getCorrelationId(),
          result: 'SUCCESS',
          data: {
            fraudScore: event.getFraudScore(),
            riskLevel: event.getRiskLevel(),
          },
        });
      } else if (event.isRejected()) {
        this.logger.warn(
          `Fraud check rejected for credit: ${event.getCreditId()}, initiating compensation`
        );
        await this.sagaCoordinator.compensate({
          correlationId: event.getCorrelationId(),
          stepName: 'fraud-check',
          reason: `Fraud check failed with recommendation: ${event.getRecommendation()}`,
        });
      } else if (event.requiresManualReview()) {
        this.logger.warn(
          `Fraud check requires manual review for credit: ${event.getCreditId()}`
        );
        await this.sagaCoordinator.processStep({
          stepName: 'fraud-check',
          correlationId: event.getCorrelationId(),
          result: 'MANUAL_REVIEW',
          data: {
            fraudScore: event.getFraudScore(),
            riskLevel: event.getRiskLevel(),
            checksPerformed: event.getChecksPerformed(),
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process FraudCheckedEvent: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  getSubscriptionStatus(): { isConsuming: boolean; topics: string[] } {
    return {
      isConsuming: this.isConsuming,
      topics: [CREDIT_ORIGINATED_TOPIC, FRAUD_CHECKED_TOPIC],
    };
  }
}

// === ARCHIVO: src/application/services/event-publisher.service.ts ===
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MessageBroker } from '@infrastructure/message-brokers/message-broker.interface';
import { OutboxRepository } from '@infrastructure/outbox/outbox.repository';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';
import awsConfig from '@infrastructure/config/aws.config';
import { CreditOriginatedEventData } from '@domain/events/credit-originated.event';
import { FraudCheckedEventData } from '@domain/events/fraud-checked.event';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private readonly messageBroker: MessageBroker;
  private readonly outboxRepository: OutboxRepository;
  private readonly awsConfiguration: ConfigType<typeof awsConfig>;

  constructor(
    @Inject('MessageBroker') messageBroker: MessageBroker,
    @Inject('OutboxRepository') outboxRepository: OutboxRepository,
    @Inject(awsConfig.KEY) awsConfiguration: ConfigType<typeof awsConfig>,
  ) {
    this.messageBroker = messageBroker;
    this.outboxRepository = outboxRepository;
    this.awsConfiguration = awsConfiguration;
  }

  async publishCreditOriginatedEvent(
    event: CreditOriginatedEvent,
  ): Promise<void> {
    const eventData = event.toPlainObject();
    const topic = this.awsConfiguration.kafka?.topics?.creditOriginated 
      || 'credit.originated';
    
    try {
      await this.outboxRepository.save({
        id: event.getEventId(),
        aggregateId: event.getCreditId(),
        aggregateType: 'Credit',
        eventType: 'CreditOriginated',
        payload: eventData,
        correlationId: event.getCorrelationId(),
        causationId: event.getOccurredAt().toISOString(),
        timestamp: event.getOccurredAt(),
        metadata: {
          purpose: event.getPurpose(),
          amount: event.getAmount(),
          isHighValue: event.isHighValue(),
          isHighRiskApplicant: event.isHighRiskApplicant(),
        },
      });

      await this.messageBroker.publish(topic, eventData, {
        correlationId: event.getCorrelationId(),
        messageId: event.getEventId(),
        timestamp: event.getOccurredAt().toISOString(),
      });

      this.logger.log(
        `Published CreditOriginatedEvent for credit ${event.getCreditId()} ` +
        `with correlation ${event.getCorrelationId()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish CreditOriginatedEvent: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async publishFraudCheckedEvent(
    event: FraudCheckedEvent,
  ): Promise<void> {
    const eventData = event.toPlainObject();
    const topic = this.awsConfiguration.kafka?.topics?.fraudChecked 
      || 'fraud.checked';
    
    try {
      await this.outboxRepository.save({
        id: event.getEventId(),
        aggregateId: event.getCreditId(),
        aggregateType: 'Credit',
        eventType: 'FraudChecked',
        payload: eventData,
        correlationId: event.getCorrelationId(),
        causationId: event.getOccurredAt().toISOString(),
        timestamp: event.getOccurredAt(),
        metadata: {
          riskLevel: event.getRiskLevel(),
          status: event.getStatus(),
          fraudScore: event.getFraudScore(),
          recommendation: event.getRecommendation(),
        },
      });

      await this.messageBroker.publish(topic, eventData, {
        correlationId: event.getCorrelationId(),
        messageId: event.getEventId(),
        timestamp: event.getOccurredAt().toISOString(),
      });

      this.logger.log(
        `Published FraudCheckedEvent for credit ${event.getCreditId()} ` +
        `with correlation ${event.getCorrelationId()}, recommendation: ${event.getRecommendation()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish FraudCheckedEvent: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async publishBatchEvents(
    events: Array<CreditOriginatedEvent | FraudCheckedEvent>,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const event of events) {
      try {
        if (event instanceof CreditOriginatedEvent) {
          await this.publishCreditOriginatedEvent(event);
        } else if (event instanceof FraudCheckedEvent) {
          await this.publishFraudCheckedEvent(event);
        }
        success++;
      } catch (error) {
        failed++;
        this.logger.warn(
          `Failed to publish event in batch: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.logger.log(
      `Batch publish completed: ${success} succeeded, ${failed} failed`,
    );

    return { success, failed };
  }

  async retryFailedEvents(maxRetries: number = 3): Promise<number> {
    try {
      const failedEvents = await this.outboxRepository.findPending();
      let retriedCount = 0;

      for (const outboxMessage of failedEvents) {
        if (outboxMessage.retryCount >= maxRetries) {
          this.logger.warn(
            `Outbox message ${outboxMessage.id} exceeded max retries, marking as dead-letter`,
          );
          await this.outboxRepository.markAsDeadLetter(outboxMessage.id);
          continue;
        }

        try {
          const topic = outboxMessage.eventType === 'CreditOriginated'
            ? (this.awsConfiguration.kafka?.topics?.creditOriginated || 'credit.originated')
            : (this.awsConfiguration.kafka?.topics?.fraudChecked || 'fraud.checked');

          await this.messageBroker.publish(
            topic,
            outboxMessage.payload,
            {
              correlationId: outboxMessage.correlationId,
              messageId: outboxMessage.id,
              timestamp: outboxMessage.timestamp.toISOString(),
            },
          );

          await this.outboxRepository.markAsProcessed(outboxMessage.id);
          retriedCount++;
        } catch (error) {
          await this.outboxRepository.incrementRetryCount(outboxMessage.id);
          this.logger.warn(
            `Retry failed for outbox message ${outboxMessage.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      this.logger.log(`Retry process completed: ${retriedCount} events retried`);
      return retriedCount;
    } catch (error) {
      this.logger.error(
        `Error during retry process: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}

// === ARCHIVO: src/application/use-cases/process-credit.usecase.ts ===
import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ulid } from 'ulid';
import { CreditOriginator } from '@domain/actors/credit-originator';
import { CreditOriginatedEvent, CreditDetails, CreditApplicant } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent, FraudCheckResult, FraudRiskLevel, FraudCheckStatus } from '@domain/events/fraud-checked.event';
import { EventPublisherService } from '@application/services/event-publisher.service';
import awsConfig from '@infrastructure/config/aws.config';

export interface ProcessCreditCommand {
  readonly applicant: {
    readonly applicantId: string;
    readonly fullName: string;
    readonly email: string;
    readonly documentType: 'CPF' | 'CNPJ' | 'PASSPORT';
    readonly documentNumber: string;
    readonly monthlyIncome: number;
    readonly creditScore: number;
  };
  readonly credit: {
    readonly amount: number;
    readonly currency: string;
    readonly termMonths: number;
    readonly interestRate: number;
    readonly purpose: 'PERSONAL' | 'BUSINESS' | 'REFINANCING' | 'CONSIGNMENT';
    readonly firstPaymentDate: Date;
  };
  readonly originatorId: string;
  readonly channel: string;
}

export interface ProcessCreditResult {
  readonly creditId: string;
  readonly status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  readonly correlationId: string;
  readonly events: Array<{ eventType: string; eventId: string }>;
  readonly message: string;
}

@Injectable()
export class ProcessCreditUseCase {
  private readonly logger = new Logger(ProcessCreditUseCase.name);
  private readonly creditOriginator: CreditOriginator;
  private readonly eventPublisher: EventPublisherService;
  private readonly awsConfiguration: ConfigType<typeof awsConfig>;

  constructor(
    @Inject('CreditOriginator') creditOriginator: CreditOriginator,
    eventPublisher: EventPublisherService,
    @Inject(awsConfig.KEY) awsConfiguration: ConfigType<typeof awsConfig>,
  ) {
    this.creditOriginator = creditOriginator;
    this.eventPublisher = eventPublisher;
    this.awsConfiguration = awsConfiguration;
  }

  async execute(command: ProcessCreditCommand): Promise<ProcessCreditResult> {
    const correlationId = ulid();
    const creditId = `CREDIT-${ulid()}`;
    const eventId = ulid();
    const occurredAt = new Date();
    
    this.logger.log(
      `Starting credit processing: creditId=${creditId}, correlationId=${correlationId}, applicant=${command.applicant.applicantId}`,
    );

    if (!this.creditOriginator.canOriginateCredit(
      this.mapToCreditDetails(creditId, command.credit),
      this.mapToCreditApplicant(command.applicant),
    )) {
      throw new BadRequestException(
        `Credit cannot be originated by originator ${this.creditOriginator.getOriginatorId()}. ` +
        `Check volume limits, amount limits, or credit purpose restrictions.`,
      );
    }

    const creditOriginatedEvent = CreditOriginatedEvent.create(
      {
        eventId,
        occurredAt,
        version: '1.0.0',
        correlationId,
      },
      {
        credit: this.mapToCreditDetails(creditId, command.credit),
        applicant: this.mapToCreditApplicant(command.applicant),
        originators: [this.creditOriginator.getOriginatorId()],
        approvedBy: this.creditOriginator.getName(),
        channel: command.channel,
      },
    );

    await this.eventPublisher.publishCreditOriginatedEvent(creditOriginatedEvent);

    const fraudCheckResult = await this.performFraudCheck(
      creditId,
      command.applicant,
      correlationId,
      occurredAt,
    );

    const status = this.determineCreditStatus(fraudCheckResult);
    
    const fraudCheckedEvent = FraudCheckedEvent.create(
      {
        eventId: ulid(),
        occurredAt: new Date(),
        version: '1.0.0',
        correlationId,
        causationId: eventId,
      },
      {
        creditId,
        applicantId: command.applicant.applicantId,
        fraudCheckId: `FRAUD-${ulid()}`,
        result: fraudCheckResult,
        breakdown: {
          identityVerification: true,
          addressVerification: true,
          incomeVerification: true,
          creditBureauCheck: true,
          velocityCheck: true,
          deviceFingerprintCheck: true,
          biometricVerification: true,
        },
        checkedBy: 'FraudEngine',
        processingTimeMs: 150,
      },
    );

    await this.eventPublisher.publishFraudCheckedEvent(fraudCheckedEvent);

    this.creditOriginator.updateMetrics(creditOriginatedEvent.data);

    this.logger.log(
      `Credit processing completed: creditId=${creditId}, status=${status}, correlationId=${correlationId}`,
    );

    return {
      creditId,
      status,
      correlationId,
      events: [
        { eventType: 'CreditOriginated', eventId: creditOriginatedEvent.getEventId() },
        { eventType: 'FraudChecked', eventId: fraudCheckedEvent.getEventId() },
      ],
      message: this.getStatusMessage(status),
    };
  }

  private async performFraudCheck(
    creditId: string,
    applicant: ProcessCreditCommand['applicant'],
    correlationId: string,
    occurredAt: Date,
  ): Promise<FraudCheckResult> {
    this.logger.debug(`Performing fraud check for credit ${creditId}`);

    const fraudScore = this.calculateFraudScore(applicant);
    const riskLevel = this.determineRiskLevel(fraudScore, applicant.creditScore);
    
    const status = riskLevel === FraudRiskLevel.LOW 
      ? FraudCheckStatus.APPROVED 
      : riskLevel === FraudRiskLevel.MEDIUM 
        ? FraudCheckStatus.REVIEW 
        : FraudCheckStatus.REJECTED;

    return {
      status,
      riskLevel,
      fraudScore,
      checksPerformed: [
        'identityVerification',
        'addressVerification',
        'incomeVerification',
        'creditBureauCheck',
        'velocityCheck',
        'deviceFingerprintCheck',
        'biometricVerification',
      ],
      flags: riskLevel !== FraudRiskLevel.LOW 
        ? ['elevated_risk', riskLevel === FraudRiskLevel.HIGH ? 'high_risk_detected' : 'review_required']
        : [],
      recommendation: status === FraudCheckStatus.APPROVED 
        ? 'APPROVE' 
        : status === FraudCheckStatus.REVIEW 
          ? 'REVIEW' 
          : 'REJECT',
    };
  }

  private calculateFraudScore(applicant: ProcessCreditCommand['applicant']): number {
    let score = 0;
    
    if (applicant.creditScore < 500) score += 40;
    else if (applicant.creditScore < 650) score += 20;
    else if (applicant.creditScore < 700) score += 10;
    
    if (applicant.monthlyIncome < 2000) score += 30;
    else if (applicant.monthlyIncome < 5000) score += 15;
    
    const documentNumber = applicant.documentNumber.replace(/\D/g, '');
    if (documentNumber.length < 8 || documentNumber.length > 14) score += 25;
    
    return Math.min(score, 100);
  }

  private determineRiskLevel(fraudScore: number, creditScore: number): FraudRiskLevel {
    if (fraudScore >= 60 || creditScore < 500) return FraudRiskLevel.HIGH;
    if (fraudScore >= 30 || creditScore < 650) return FraudRiskLevel.MEDIUM;
    return FraudRiskLevel.LOW;
  }

  private determineCreditStatus(fraudCheckResult: FraudCheckResult): 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW' {
    switch (fraudCheckResult.recommendation) {
      case 'APPROVE':
        return 'APPROVED';
      case 'REJECT':
        return 'REJECTED';
      case 'REVIEW':
      default:
        return 'PENDING_REVIEW';
    }
  }

  private getStatusMessage(status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW'): string {
    switch (status) {
      case 'APPROVED':
        return 'Credit has been approved and events published successfully.';
      case 'REJECTED':
        return 'Credit has been rejected due to fraud risk assessment.';
      case 'PENDING_REVIEW':
        return 'Credit requires manual review. Events have been published for processing.';
    }
  }

  private mapToCreditDetails(creditId: string, credit: ProcessCreditCommand['credit']): CreditDetails {
    const monthlyRate = credit.interestRate / 100 / 12;
    const installments = credit.termMonths;
    const installmentAmount = credit.amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
      (Math.pow(1 + monthlyRate, installments) - 1);

    return {
      creditId,
      amount: credit.amount,
      currency: credit.currency,
      termMonths: credit.termMonths,
      interestRate: credit.interestRate,
      purpose: credit.purpose,
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      firstPaymentDate: credit.firstPaymentDate,
    };
  }

  private mapToCreditApplicant(applicant: ProcessCreditCommand['applicant']): CreditApplicant {
    return {
      applicantId: applicant.applicantId,
      fullName: applicant.fullName,
      email: applicant.email,
      documentType: applicant.documentType,
      documentNumber: applicant.documentNumber,
      monthlyIncome: applicant.monthlyIncome,
      creditScore: applicant.creditScore,
    };
  }
}

// === ARCHIVO: src/app.module.ts ===
import { Module, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventPublisherService } from '@application/services/event-publisher.service';
import { ProcessCreditUseCase } from '@application/use-cases/process-credit.usecase';
import { CreditOriginator } from '@domain/actors/credit-originator';
import awsConfig from '@infrastructure/config/aws.config';
import kafkaConfig from '@infrastructure/config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig, kafkaConfig],
      envFilePath: '.env',
      validationOptions: {
        allowUnknownKeys: true,
        stripUnknown: true,
      },
    }),
  ],
  providers: [
    {
      provide: 'Logger',
      useValue: new Logger('Application'),
    },
    {
      provide: 'MessageBroker',
      useFactory: async (configService: ConfigService) => {
        const brokerType = configService.get<string>('messageBroker.type', { infer: true }) || 'kafka';
        const { MessageBrokerFactory } = await import('./infrastructure/message-brokers/message-broker.factory');
        return MessageBrokerFactory.create(brokerType, configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'OutboxRepository',
      useFactory: async (configService: ConfigService) => {
        const dbType = configService.get<string>('database.outbox.type', { infer: true }) || 'dynamodb';
        const { OutboxRepositoryFactory } = await import('./infrastructure/outbox/outbox-repository.factory');
        return OutboxRepositoryFactory.create(dbType, configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'SagaCoordinator',
      useFactory: async (
        configService: ConfigService,
        @Inject('OutboxRepository') outboxRepository: any,
      ) => {
        const { SagaCoordinatorService } = await import('./infrastructure/saga/saga-coordinator.service');
        return new SagaCoordinatorService(
          outboxRepository,
          configService,
          new Logger('SagaCoordinator'),
        );
      },
      inject: [ConfigService, 'OutboxRepository'],
    },
    {
      provide: 'CreditOriginator',
      useFactory: (configService: ConfigService) => {
        return CreditOriginator.create({
          originatorId: configService.get<string>('originator.id', { infer: true }) || 'ORIG-001',
          name: configService.get<string>('originator.name', { infer: true }) || 'Premium Credit Originator',
          type: 'BANK' as any,
          status: 'ACTIVE' as any,
          configuration: {
            maxSingleCreditAmount: configService.get<number>('originator.maxSingleCreditAmount', { infer: true }) || 100000,
            maxMonthlyCreditVolume: configService.get<number>('originator.maxMonthlyCreditVolume', { infer: true }) || 5000000,
            allowedCreditPurposes: ['PERSONAL', 'BUSINESS', 'REFINANCING', 'CONSIGNMENT'],
            requiresManualApproval: false,
            approvalThreshold: 750,
          },
        });
      },
      inject: [ConfigService],
    },
    EventPublisherService,
    ProcessCreditUseCase,
  ],
  exports: [
    EventPublisherService,
    ProcessCreditUseCase,
    'MessageBroker',
    'OutboxRepository',
    'SagaCoordinator',
    'CreditOriginator',
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppModule.name);
  private messageBroker: any;
  private outboxRepository: any;

  constructor(
    @Inject('MessageBroker') messageBroker: any,
    @Inject('OutboxRepository') outboxRepository: any,
  ) {
    this.messageBroker = messageBroker;
    this.outboxRepository = outboxRepository;
  }

  async onModuleInit() {
    this.logger.log('Initializing event-driven credit processing application');
    
    try {
      if (this.messageBroker && typeof this.messageBroker.connect === 'function') {
        await this.messageBroker.connect();
        this.logger.log('Message broker connected successfully');
      }

      if (this.outboxRepository && typeof this.outboxRepository.initialize === 'function') {
        await this.outboxRepository.initialize();
        this.logger.log('Outbox repository initialized successfully');
      }

      this.logger.log(
        'Event-driven outbox pattern system initialized successfully. ' +
        'Distributed saga coordinator ready.',
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize application: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down event-driven credit processing application');
    
    try {
      if (this.messageBroker && typeof this.messageBroker.disconnect === 'function') {
        await this.messageBroker.disconnect();
        this.logger.log('Message broker disconnected successfully');
      }

      this.logger.log('Application shutdown complete');
    } catch (error) {
      this.logger.error(
        `Error during shutdown: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}


// === ARCHIVO: test/e2e/application/process-credit.e2e-spec.ts ===
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as sinon from 'sinon';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent, FraudCheckStatus, FraudRiskLevel } from '@domain/events/fraud-checked.event';
import { CreditOriginator } from '@domain/actors/credit-originator';
import { CreditApplicant, CreditDetails } from '@domain/events/credit-originated.event';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

describe('ProcessCredit E2E - Flujo Completo con Saga y Outbox', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  
  let kafkaContainer: StartedTestContainer;
  let postgresContainer: StartedTestContainer;
  let dynamodbContainer: StartedTestContainer;
  
  const CREDIT_ID = 'credit-001';
  const APPLICANT_ID = 'applicant-001';
  const CORRELATION_ID = 'corr-saga-001';

  const testApplicant: CreditApplicant = {
    applicantId: APPLICANT_ID,
    fullName: 'Juan Pérez García',
    email: 'juan.perez@example.com',
    documentType: 'CPF' as const,
    documentNumber: '12345678901',
    monthlyIncome: 8500.00,
    creditScore: 720
  };

  const testCreditDetails: CreditDetails = {
    creditId: CREDIT_ID,
    amount: 50000,
    currency: 'BRL',
    termMonths: 36,
    interestRate: 0.0245,
    purpose: 'PERSONAL' as const,
    installmentAmount: 1525.50,
    firstPaymentDate: new Date('2025-03-15')
  };

  beforeAll(async () => {
    kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:7.5.0')
      .withEnvironment({
        KAFKA_NODE_ID: '1',
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT',
        KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093',
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092',
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@localhost:9093',
        KAFKA_PROCESS_ROLES: 'broker,controller',
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: '1',
        KAFKA_LOG_DIRS: '/var/lib/kafka/data',
        CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
      })
      .withExposedPorts(9092)
      .start();

    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_USER: 'credit_user',
        POSTGRES_PASSWORD: 'credit_pass',
        POSTGRES_DB: 'credit_db'
      })
      .withExposedPorts(5432)
      .start();

    dynamodbContainer = await new GenericContainer('amazon/dynamodb-local:latest')
      .withExposedPorts(8000)
      .start();

    process.env.KAFKA_BROKER = `localhost:${kafkaContainer.getMappedPort(9092)}`;
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PORT = String(postgresContainer.getMappedPort(5432));
    process.env.POSTGRES_DB = 'credit_db';
    process.env.POSTGRES_USER = 'credit_user';
    process.env.POSTGRES_PASSWORD = 'credit_pass';
    process.env.DYNAMODB_ENDPOINT = `http://localhost:${dynamodbContainer.getMappedPort(8000)}`;
    process.env.AWS_REGION = 'us-east-1';
  }, 300000);

  afterAll(async () => {
    if (kafkaContainer) await kafkaContainer.stop();
    if (postgresContainer) await postgresContainer.stop();
    if (dynamodbContainer) await dynamodbContainer.stop();
  });

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: []
    }).compile();

    app = testingModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('Flujo de Origenación de Crédito con Saga', () => {
    it('debe procesar crédito completo y persistir eventos en outbox', async () => {
      const originator = CreditOriginator.create({
        originatorId: 'originator-001',
        name: 'Banco Central',
        type: 'BANK' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 100000,
          maxMonthlyCreditVolume: 500000,
          allowedCreditPurposes: ['PERSONAL', 'BUSINESS', 'REFINANCING', 'CONSIGNMENT'],
          requiresManualApproval: false,
          approvalThreshold: 650
        }
      });

      const canOriginate = originator.canOriginateCredit(testCreditDetails, testApplicant);
      expect(canOriginate).toBe(true);

      const event = originator.createCreditOriginatedEvent(
        testCreditDetails,
        testApplicant,
        ['originator-001'],
        'system',
        'WEB'
      );

      expect(event.getCreditId()).toBe(CREDIT_ID);
      expect(event.getApplicantId()).toBe(APPLICANT_ID);
      expect(event.getAmount()).toBe(50000);
      expect(event.isHighValue()).toBe(false);
      expect(event.isHighRiskApplicant()).toBe(false);

      const eventData = event.toPlainObject();
      expect(eventData.eventType).toBe('CREDIT_ORIGINATED');
      expect(eventData.data.credit.creditId).toBe(CREDIT_ID);
      expect(eventData.data.applicant.email).toBe('juan.perez@example.com');
    });

    it('debe validar correctamente la evaluación de fraude', () => {
      const fraudCheckResult = {
        status: FraudCheckStatus.APPROVED,
        riskLevel: FraudRiskLevel.LOW,
        fraudScore: 15,
        checksPerformed: ['identity', 'address', 'income', 'credit_bureau', 'velocity', 'device'],
        flags: [],
        recommendation: 'APPROVE' as const
      };

      const breakdown = {
        identityVerification: true,
        addressVerification: true,
        incomeVerification: true,
        creditBureauCheck: true,
        velocityCheck: true,
        deviceFingerprintCheck: true,
        biometricVerification: false
      };

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-check-001',
        result: fraudCheckResult,
        breakdown,
        checkedBy: 'fraud-engine',
        processingTimeMs: 250
      });

      expect(fraudEvent.getCreditId()).toBe(CREDIT_ID);
      expect(fraudEvent.getRiskLevel()).toBe(FraudRiskLevel.LOW);
      expect(fraudEvent.isApproved()).toBe(true);
      expect(fraudEvent.isRejected()).toBe(false);
      expect(fraudEvent.requiresManualReview()).toBe(false);
      expect(fraudEvent.getFraudScore()).toBe(15);
      expect(fraudEvent.getRecommendation()).toBe('APPROVE');

      const plainEvent = fraudEvent.toPlainObject();
      expect(plainEvent.eventType).toBe('FRAUD_CHECKED');
      expect(plainEvent.data.result.status).toBe('APPROVED');
    });

    it('debe detectar crédito de alto valor correctamente', () => {
      const highValueCredit: CreditDetails = {
        ...testCreditDetails,
        creditId: 'credit-high-value',
        amount: 250000
      };

      const event = CreditOriginatedEvent.create({
        credit: highValueCredit,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'BRANCH'
      });

      expect(event.isHighValue()).toBe(true);
      expect(event.getAmount()).toBe(250000);
    });

    it('debe detectar applicant de alto riesgo', () => {
      const highRiskApplicant: CreditApplicant = {
        ...testApplicant,
        applicantId: 'high-risk-applicant',
        creditScore: 480
      };

      const event = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: highRiskApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      expect(event.isHighRiskApplicant()).toBe(true);
      expect(event.getApplicantId()).toBe('high-risk-applicant');
    });

    it('debe rechazar crédito que excede límite del originator', () => {
      const limitedOriginator = CreditOriginator.create({
        originatorId: 'limited-originator',
        name: 'Fintech Limitada',
        type: 'FINTECH' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 10000,
          maxMonthlyCreditVolume: 100000,
          allowedCreditPurposes: ['PERSONAL'],
          requiresManualApproval: true,
          approvalThreshold: 700
        }
      });

      const canOriginate = limitedOriginator.canOriginateCredit(testCreditDetails, testApplicant);
      expect(canOriginate).toBe(false);
    });

    it('debe manejar falla de fraude y generar evento de rechazo', () => {
      const fraudCheckResult = {
        status: FraudCheckStatus.REJECTED,
        riskLevel: FraudRiskLevel.HIGH,
        fraudScore: 92,
        checksPerformed: ['identity', 'address', 'income', 'credit_bureau', 'velocity', 'device', 'biometric'],
        flags: ['document_expired', 'address_mismatch', 'velocity_high'],
        recommendation: 'REJECT' as const
      };

      const breakdown = {
        identityVerification: false,
        addressVerification: false,
        incomeVerification: true,
        creditBureauCheck: true,
        velocityCheck: false,
        deviceFingerprintCheck: true,
        biometricVerification: false
      };

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-check-reject',
        result: fraudCheckResult,
        breakdown,
        checkedBy: 'fraud-engine',
        processingTimeMs: 180
      });

      expect(fraudEvent.isRejected()).toBe(true);
      expect(fraudEvent.isHighRisk()).toBe(true);
      expect(fraudEvent.getRecommendation()).toBe('REJECT');
      expect(fraudEvent.getRiskLevel()).toBe(FraudRiskLevel.HIGH);
      expect(fraudEvent.getChecksPerformed().length).toBe(7);
    });

    it('debe validar correlación de eventos en saga', () => {
      const creditEvent = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-check-001',
        result: {
          status: FraudCheckStatus.APPROVED,
          riskLevel: FraudRiskLevel.LOW,
          fraudScore: 10,
          checksPerformed: ['all'],
          flags: [],
          recommendation: 'APPROVE' as const
        },
        breakdown: {
          identityVerification: true,
          addressVerification: true,
          incomeVerification: true,
          creditBureauCheck: true,
          velocityCheck: true,
          deviceFingerprintCheck: true,
          biometricVerification: true
        },
        checkedBy: 'fraud-engine',
        processingTimeMs: 200
      });

      expect(creditEvent.getCorrelationId()).toBeDefined();
      expect(fraudEvent.getCorrelationId()).toBeDefined();
    });
  });

  describe('Outbox Pattern - Persistencia de Eventos', () => {
    it('debe generar estructura correcta de mensaje para outbox', () => {
      const event = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'MOBILE'
      });

      const plainObject = event.toPlainObject();
      
      expect(plainObject).toHaveProperty('eventType');
      expect(plainObject).toHaveProperty('metadata');
      expect(plainObject).toHaveProperty('data');
      expect(plainObject.metadata).toHaveProperty('eventId');
      expect(plainObject.metadata).toHaveProperty('occurredAt');
      expect(plainObject.metadata).toHaveProperty('correlationId');
      expect(plainObject.metadata).toHaveProperty('version');
      
      expect(plainObject.data).toHaveProperty('credit');
      expect(plainObject.data).toHaveProperty('applicant');
      expect(plainObject.data.credit).toHaveProperty('creditId');
      expect(plainObject.data.applicant).toHaveProperty('applicantId');
    });

    it('debe mantener idempotencia mediante eventId único', () => {
      const event1 = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      const event2 = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      expect(event1.getEventId()).not.toBe(event2.getEventId());
      expect(event1.getCorrelationId()).not.toBe(event2.getCorrelationId());
    });
  });

  describe('Saga - Compensaciones y Retry', () => {
    it('debe identificar cuando se requiere revisión manual', () => {
      const reviewFraudResult = {
        status: FraudCheckStatus.REVIEW,
        riskLevel: FraudRiskLevel.MEDIUM,
        fraudScore: 55,
        checksPerformed: ['identity', 'address', 'income', 'credit_bureau'],
        flags: ['income_unverified'],
        recommendation: 'REVIEW' as const
      };

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-review-001',
        result: reviewFraudResult,
        breakdown: {
          identityVerification: true,
          addressVerification: true,
          incomeVerification: false,
          creditBureauCheck: true,
          velocityCheck: true,
          deviceFingerprintCheck: true,
          biometricVerification: false
        },
        checkedBy: 'fraud-engine',
        processingTimeMs: 150
      });

      expect(fraudEvent.requiresManualReview()).toBe(true);
      expect(fraudEvent.getStatus()).toBe(FraudCheckStatus.REVIEW);
    });

    it('debe validar métricas del originator después de originar crédito', () => {
      const originator = CreditOriginator.create({
        originatorId: 'metrics-originator',
        name: 'Banco Metrics',
        type: 'BANK' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 200000,
          maxMonthlyCreditVolume: 1000000,
          allowedCreditPurposes: ['PERSONAL', 'BUSINESS'],
          requiresManualApproval: false,
          approvalThreshold: 600
        }
      });

      const eventData = {
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['metrics-originator'],
        approvedBy: 'system',
        channel: 'WEB'
      };

      originator.updateMetrics(eventData);
      
      const metrics = originator.getMetrics();
      expect(metrics.totalCreditsOriginated).toBe(1);
      expect(metrics.totalVolumeProcessed).toBe(50000);
      expect(metrics.averageCreditScore).toBe(720);
      expect(metrics.approvalRate).toBe(100);
    });

    it('debe verificar límites de volumen del originator', () => {
      const originator = CreditOriginator.create({
        originatorId: 'volume-originator',
        name: 'Banco Volumen',
        type: 'BANK' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 50000,
          maxMonthlyCreditVolume: 100000,
          allowedCreditPurposes: ['PERSONAL'],
          requiresManualApproval: false,
          approvalThreshold: 650
        }
      });

      const withinLimit = originator.isWithinVolumeLimit(95000, 3000);
      expect(withinLimit).toBe(false);

      const stillWithin = originator.isWithinVolumeLimit(80000, 15000);
      expect(stillWithin).toBe(true);
    });
  });

  describe('Configuración de brokers de mensajes', () => {
    it('debe tener configurado broker de kafka en entorno', () => {
      expect(process.env.KAFKA_BROKER).toBeDefined();
      expect(process.env.KAFKA_BROKER).toContain('localhost');
    });

    it('debe tener configurado postgres en entorno', () => {
      expect(process.env.POSTGRES_HOST).toBeDefined();
      expect(process.env.POSTGRES_PORT).toBeDefined();
      expect(process.env.POSTGRES_USER).toBeDefined();
      expect(process.env.POSTGRES_PASSWORD).toBeDefined();
    });

    it('debe tener configurado dynamodb en entorno', () => {
      expect(process.env.DYNAMODB_ENDPOINT).toBeDefined();
      expect(process.env.AWS_REGION).toBeDefined();
    });
  });
});


// === ARCHIVO: docs/comparison-kafka-vs-sqs.md ===
# Comparación técnica: Apache Kafka vs Amazon SQS FIFO

## Resumen ejecutivo

Este documento presenta una comparación técnica entre Apache Kafka y Amazon SQS FIFO para el procesamiento de eventos en un sistema de créditos con arquitectura event-driven. La evaluación cubre cuatro dimensiones operativas críticas: consistencia, latencia, escalabilidad y fault tolerance.

## 1. Consistencia y garantías de entrega

### Apache Kafka

- **Garantía base**: At-least-once por defecto
- **Modo exactamente-once (EOS)**: Disponible mediante `enable.idempotence: true` + transacciones
- **Configuración requerida**: `isolation.level: read_committed` en consumidores
- **Ordenación por partición**: Kafka garantiza orden dentro de una partición, no entre particiones
- **Replicación**: Factor de replicación configurable (recomendado 3)
- **Consideración**: EOS en Kafka 3.0+ alcanza semantics exactamente-once pero con overhead de ~10-15% en latency

### Amazon SQS FIFO

- **Garantía base**: Exactly-once delivery por diseño
- **Deduplicación**: Mediante `MessageDeduplicationId` (intervalo de 5 minutos)
- **Ordenación**: Garantizada dentro de una cola FIFO
- **Límite de throughput**: 300 msgs/segundo por cola (burst hasta 3000)
- **Consideración**: No requiere configuración adicional para exactamente-once

**Comparación directa**: SQS FIFO ofrece exactly-once nativo sin configuración; Kafka lo logra con configuración avanzada y trade-offs en throughput.

## 2. Latencia y throughput

### Apache Kafka

- **Latencia end-to-end**: 2-5ms en condiciones óptimas
- **Throughput**: Horizontally scalable hasta millones de mensajes/segundo
- **Batch processing**: Productores y consumidores procesan en batches
- **Compression**: Soporta gzip, snappy, lz4, zstd
- **Particiones**: Escalabilidad lineal con número de particiones
- **Consideración**: Latencia mínima requiere optimización de batch size y linger.ms

### Amazon SQS FIFO

- **Latencia end-to-end**: 10-50ms (depende de región y carga)
- **Throughput**: 300 msgs/segundo base, burst de 3000 msgs/segundo
- **Batch no disponible**: Procesamiento mensaje a mensaje
- **Consideración**: Límite de throughput puede ser restrictivo para sistemas de alto volumen

**Comparación directa**: Kafka ofrece latencia menor y throughput superior; SQS FIFO tiene límitesfixed que pueden requerir múltiples colas para escalar.

## 3. Escalabilidad

### Apache Kafka

- **Escalado horizontal**: Agregar brokers y particiones dinámicamente
- **Particiones múltiples**: Permite paralelismo de consumidores
- **Rebalancing**: Kafka rebalancea particiones automáticamente
- **Consumer groups**: Escalado de consumidores mediante grupos
- **Consideración**: Requiere planificación de número de particiones (múltiplo de consumidores)

### Amazon SQS FIFO

- **Escalado vertical**: Límites de cola fijos
- **Multiple queues**: Escalado mediante múltiples colas FIFO
- **Auto-scaling**: No disponible nativamente (requiere CloudWatch + Lambda)
- **Consideración**: Modelos de arquitectura deben considerar límites de cola

**Comparación directa**: Kafka escala linealmente; SQS FIFO requiere diseño con múltiples colas para workloads de alto volumen.

## 4. Fault Tolerance y durabilidad

### Apache Kafka

- **Replicación**: Configurable (factor 3 recomendado)
- **ISR (In-Sync Replicas)**: Tolerancia a fallos de brokers
- **Log retention**: Configurable por tiempo y tamaño
- **Consumer offset management**: Checkpoints periódicos
- **Consideración**: Recuperación de lag tras fallo depende de tamaño del log

### Amazon SQS FIFO

- **Duplicación**: 11 9's de durabilidad (redundancia multinodo)
- **Retention**: Hasta 14 días (configurable)
- **Dead Letter Queue**: Soportado nativamente
- **Consideración**: AWS maneja replicación automáticamente

**Comparación directa**: Ambos ofrecen durabilidad alta; Kafka requiere configuración explícita; SQS FIFO la proporciona por defecto.

## Matriz comparativa

| Característica | Kafka | SQS FIFO |
|----------------|-------|----------|
| Exactly-once | Configurable | Nativo |
| Ordenación | Por partición | Por cola |
| Latencia típica | 2-5ms | 10-50ms |
| Throughput | Millones/s | 300/s (3000 burst) |
| Escalabilidad | Horizontal nativa | Múltiples colas |
| Durabilidad | Configurable | 11 9's |
| Ops overhead | Alto | Bajo (managed) |
| Cost model | Infra + ops | Pay-per-use |

## Recomendación

**Para este sistema de procesamiento de créditos**:

1. **SQS FIFO recomendado para**: Eventos de compensación de saga, mensajes de baja frecuencia donde exactly-once es crítico y latencia de ~50ms es aceptable.

2. **Kafka recomendado para**: Eventos de alto volumen (credit-originated, fraud-checked), donde latencia mínima y throughput alto son prioritarios.

3. **Arquitectura híbrida sugerida**: Kafka como bus de eventos principal para el flujo happy-path; SQS FIFO para cola de dead letters y mensajes de compensación que requieren exactamente-once garantizado.

## Referencias

- Apache Kafka Documentation: https://kafka.apache.org/documentation/
- Amazon SQS FIFO: https://docs.aws.amazon.com/sqs/
- Kafka Exactly-Once Semantics: https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how/

---
*Documento generado para sistema de procesamiento de créditos con outbox pattern y saga distribuida.*

// === ARCHIVO: docs/domain-model.md ===
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

// === ARCHIVO: docs/architecture-decision-record.md ===
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

// === ARCHIVO: src/domain/models/outbox-message.model.ts ===
export enum OutboxMessageStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

export enum OutboxMessageType {
  CREDIT_ORIGINATED = 'CREDIT_ORIGINATED',
  FRAUD_CHECKED = 'FRAUD_CHECKED',
  CREDIT_REVERSED = 'CREDIT_REVERSED',
  FUNDS_RELEASED = 'FUNDS_RELEASED',
  FRAUD_ALERT = 'FRAUD_ALERT',
  COMPENSATION = 'COMPENSATION',
}

export interface OutboxMessagePayload {
  readonly eventType: string;
  readonly eventId: string;
  readonly data: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
}

export interface OutboxMessage {
  readonly id: string;
  readonly messageId?: string;
  readonly eventId: string;
  readonly eventType?: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly type: OutboxMessageType;
  readonly payload: OutboxMessagePayload;
  readonly status: OutboxMessageStatus;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly createdAt: Date;
  readonly processedAt?: Date;
  readonly publishedAt?: Date;
  readonly lastError?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly version: number;
  readonly retryCount?: number;
}

export interface OutboxMessageCreateInput {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly type: OutboxMessageType;
  readonly payload: OutboxMessagePayload;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly maxAttempts?: number;
}

export interface OutboxMessageUpdateInput {
  readonly status?: OutboxMessageStatus;
  readonly attempts?: number;
  readonly lastError?: string;
  readonly processedAt?: Date;
  readonly publishedAt?: Date;
}

export interface OutboxMessageFilter {
  readonly status?: OutboxMessageStatus;
  readonly type?: OutboxMessageType;
  readonly aggregateId?: string;
  readonly correlationId?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  readonly limit?: number;
  readonly offset?: number;
}

export class OutboxMessageEntity implements OutboxMessage {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly type: OutboxMessageType;
  readonly payload: OutboxMessagePayload;
  private _status: OutboxMessageStatus;
  private _attempts: number;
  readonly maxAttempts: number;
  readonly createdAt: Date;
  private _processedAt?: Date;
  private _publishedAt?: Date;
  private _lastError?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly version: number;

  private constructor(
    id: string,
    aggregateId: string,
    aggregateType: string,
    type: OutboxMessageType,
    payload: OutboxMessagePayload,
    status: OutboxMessageStatus,
    attempts: number,
    maxAttempts: number,
    createdAt: Date,
    correlationId: string,
    causationId: string | undefined,
    version: number,
  ) {
    this.id = id;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.type = type;
    this.payload = payload;
    this._status = status;
    this._attempts = attempts;
    this.maxAttempts = maxAttempts;
    this.createdAt = createdAt;
    this.correlationId = correlationId;
    this.causationId = causationId;
    this.version = version;
  }

  static create(input: OutboxMessageCreateInput): OutboxMessageEntity {
    const now = new Date();
    return new OutboxMessageEntity(
      `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      input.aggregateId,
      input.aggregateType,
      input.type,
      input.payload,
      OutboxMessageStatus.PENDING,
      0,
      input.maxAttempts || 5,
      now,
      input.correlationId,
      input.causationId,
      1,
    );
  }

  static fromPersistence(
    data: Record<string, unknown>,
  ): OutboxMessageEntity {
    return new OutboxMessageEntity(
      data.id as string,
      data.aggregateId as string,
      data.aggregateType as string,
      data.type as OutboxMessageType,
      data.payload as OutboxMessagePayload,
      (data.status as OutboxMessageStatus) || OutboxMessageStatus.PENDING,
      (data.attempts as number) || 0,
      (data.maxAttempts as number) || 5,
      data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt as string),
      data.correlationId as string,
      data.causationId as string | undefined,
      (data.version as number) || 1,
    );
  }

  get status(): OutboxMessageStatus {
    return this._status;
  }

  get attempts(): number {
    return this._attempts;
  }

  get processedAt(): Date | undefined {
    return this._processedAt;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get lastError(): string | undefined {
    return this._lastError;
  }

  markAsProcessing(): void {
    this._status = OutboxMessageStatus.PENDING;
  }

  markAsPublished(): void {
    this._status = OutboxMessageStatus.PROCESSED;
    this._processedAt = new Date();
  }

  markAsFailed(error: string): void {
    this._status = OutboxMessageStatus.FAILED;
    this._lastError = error;
  }

  markAsDuplicate(): void {
    this._status = OutboxMessageStatus.PROCESSED;
  }

  canRetry(): boolean {
    return this._attempts < this.maxAttempts && this._status !== OutboxMessageStatus.PROCESSED;
  }

  isTerminal(): boolean {
    return (
      this._status === OutboxMessageStatus.PROCESSED ||
      (this._status === OutboxMessageStatus.FAILED && !this.canRetry())
    );
  }

  shouldBeDeleted(): boolean {
    return (
      this._status === OutboxMessageStatus.PROCESSED &&
      this.wasPublishedMoreThanDaysAgo(30)
    );
  }

  private wasPublishedMoreThanDaysAgo(days: number): boolean {
    if (!this._processedAt) return false;
    const now = new Date();
    const diff = now.getTime() - this._processedAt.getTime();
    return diff > days * 24 * 60 * 60 * 1000;
  }

  incrementAttempt(): void {
    this._attempts += 1;
  }

  getRetryDelay(): number {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, this._attempts), maxDelay);
    return delay + Math.random() * 1000;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      type: this.type,
      payload: this.payload,
      status: this._status,
      attempts: this._attempts,
      maxAttempts: this.maxAttempts,
      createdAt: this.createdAt,
      processedAt: this._processedAt,
      publishedAt: this._publishedAt,
      lastError: this._lastError,
      correlationId: this.correlationId,
      causationId: this.causationId,
      version: this.version,
    };
  }

  toDynamoDBItem(): Record<string, unknown> {
    return {
      pk: `OUTBOX#${this.id}`,
      sk: `OUTBOX#${this.id}`,
      id: this.id,
      eventId: this.payload.eventId,
      eventType: this.payload.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      type: this.type,
      payload: this.payload,
      status: this._status,
      attempts: this._attempts,
      maxAttempts: this.maxAttempts,
      createdAt: this.createdAt.toISOString(),
      processedAt: this._processedAt?.toISOString(),
      publishedAt: this._publishedAt?.toISOString(),
      lastError: this._lastError,
      correlationId: this.correlationId,
      causationId: this.causationId,
      version: this.version,
      gsi1pk: `STATUS#${this._status}`,
      gsi1sk: `CREATED#${this.createdAt.getTime()}`,
    };
  }

  static fromDynamoDBItem(item: Record<string, unknown>): OutboxMessageEntity {
    return new OutboxMessageEntity(
      item.id as string,
      item.aggregateId as string,
      item.aggregateType as string,
      item.type as OutboxMessageType,
      item.payload as OutboxMessagePayload,
      (item.status as OutboxMessageStatus) || OutboxMessageStatus.PENDING,
      (item.attempts as number) || 0,
      (item.maxAttempts as number) || 5,
      item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt as string),
      item.correlationId as string,
      item.causationId as string | undefined,
      (item.version as number) || 1,
    );
  }

  toPostgresRow(): Record<string, unknown> {
    return {
      id: this.id,
      aggregate_id: this.aggregateId,
      aggregate_type: this.aggregateType,
      type: this.type,
      payload: JSON.stringify(this.payload),
      status: this._status,
      attempts: this._attempts,
      max_attempts: this.maxAttempts,
      created_at: this.createdAt,
      processed_at: this._processedAt,
      published_at: this._publishedAt,
      last_error: this._lastError,
      correlation_id: this.correlationId,
      causation_id: this.causationId,
      version: this.version,
    };
  }

  static fromPostgresRow(row: Record<string, unknown>): OutboxMessageEntity {
    return new OutboxMessageEntity(
      row.id as string,
      row.aggregate_id as string,
      row.aggregate_type as string,
      row.type as OutboxMessageType,
      typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      row.status as OutboxMessageStatus,
      row.attempts as number,
      row.max_attempts as number,
      row.created_at instanceof Date ? row.created_at : new Date(row.created_at as string),
      row.correlation_id as string,
      row.causation_id as string | undefined,
      row.version as number,
    );
  }

  equals(other: OutboxMessageEntity): boolean {
    return this.id === other.id;
  }

  getPartitionKey(): string {
    return `OUTBOX#${this.id}`;
  }

  getSortKey(): string {
    return `OUTBOX#${this.id}`;
  }
}

// === ARCHIVO: src/infrastructure/saga/retries/retry-strategy.service.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RetryConfig {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly jitter: 'full' | 'decorrelated' | 'none';
  readonly retryableErrors: ReadonlyArray<string>;
}

export interface RetryContext {
  readonly operationId: string;
  readonly sagaId: string;
  readonly correlationId: string;
  readonly operationType: string;
  readonly attemptNumber: number;
  readonly lastError?: string;
}

export interface RetryResult<T> {
  readonly success: boolean;
  readonly result?: T;
  readonly attempts: number;
  readonly totalTimeMs: number;
  readonly errors: string[];
}

@Injectable()
export class RetryStrategyService {
  private readonly logger = new Logger(RetryStrategyService.name);
  private readonly defaultConfig: RetryConfig;
  private readonly operationConfigs: Map<string, RetryConfig>;
  private readonly locks: Map<string, { lockedAt: Date; expiresAt: Date }>;

  constructor(private readonly configService: ConfigService) {
    this.defaultConfig = {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      jitter: 'full',
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'],
    };
    this.operationConfigs = new Map();
    this.locks = new Map();
  }

  async shouldRetry(correlationId: string, stepName: string): Promise<boolean> {
    const lockKey = `${correlationId}:${stepName}`;
    const lock = this.locks.get(lockKey);
    
    if (lock) {
      const now = new Date();
      if (lock.expiresAt > now) {
        this.logger.debug(`Lock still active for ${lockKey}, allowing retry`);
        return true;
      }
      this.locks.delete(lockKey);
    }
    
    return true;
  }

  async acquireLock(correlationId: string, stepName: string): Promise<boolean> {
    const lockKey = `${correlationId}:${stepName}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30000);
    
    const existingLock = this.locks.get(lockKey);
    if (existingLock && existingLock.expiresAt > now) {
      this.logger.warn(`Lock already held for ${lockKey}`);
      return false;
    }
    
    this.locks.set(lockKey, { lockedAt: now, expiresAt });
    this.logger.debug(`Lock acquired for ${lockKey}`);
    return true;
  }

  async releaseLock(correlationId: string, stepName: string): Promise<void> {
    const lockKey = `${correlationId}:${stepName}`;
    this.locks.delete(lockKey);
    this.logger.debug(`Lock released for ${lockKey}`);
  }

  private resolveConfig(operationType: string, customConfig?: Partial<RetryConfig>): RetryConfig {
    const operationConfig = this.operationConfigs.get(operationType);
    return {
      ...this.defaultConfig,
      ...operationConfig,
      ...customConfig,
    };
  }

  private createDelayGenerator(
    config: RetryConfig,
  ): (attempt: number) => number {
    return (attempt: number): number => {
      let delay = Math.min(
        config.initialDelayMs * Math.pow(2, attempt),
        config.maxDelayMs,
      );

      if (config.jitter === 'full') {
        delay = delay * (0.5 + Math.random() * 0.5);
      } else if (config.jitter === 'decorrelated') {
        delay = delay * (0.5 + Math.random());
      }

      return Math.floor(delay);
    };
  }

  private isRetryableError(error: string, retryableErrors: ReadonlyArray<string>): boolean {
    return retryableErrors.some((retryable) => error.includes(retryable));
  }

  getConfigForOperation(operationType: string): RetryConfig {
    return this.operationConfigs.get(operationType) || this.defaultConfig;
  }

  isOperationRetryable(operationType: string): boolean {
    const config = this.getConfigForOperation(operationType);
    return config.maxAttempts > 0;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: RetryContext,
    customConfig?: Partial<RetryConfig>,
  ): Promise<RetryResult<T>> {
    const config = this.resolveConfig(context.operationType, customConfig);
    const delayGenerator = this.createDelayGenerator(config);
    const errors: string[] = [];
    const startTime = Date.now();

    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          result,
          attempts: attempt + 1,
          totalTimeMs: Date.now() - startTime,
          errors,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errorMessage);

        if (!this.isRetryableError(errorMessage, config.retryableErrors)) {
          return {
            success: false,
            attempts: attempt + 1,
            totalTimeMs: Date.now() - startTime,
            errors,
          };
        }

        if (attempt < config.maxAttempts - 1) {
          const delay = delayGenerator(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      attempts: config.maxAttempts,
      totalTimeMs: Date.now() - startTime,
      errors,
    };
  }
}

// === ARCHIVO: src/infrastructure/saga/saga-coordinator.service.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { CompensationHandler } from './compensations/compensation.handler';
import { RetryStrategyService } from './retries/retry-strategy.service';
import { randomUUID } from 'crypto';

export enum SagaStepStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export interface SagaStep {
  stepId: string;
  name: string;
  status: SagaStepStatus;
  compensationHandler?: CompensationHandler;
  compensateAction?: () => Promise<void>;
  executeAction: () => Promise<void>;
  metadata?: Record<string, unknown>;
}

export interface SagaState {
  sagaId: string;
  correlationId: string;
  status: SagaStepStatus;
  steps: SagaStep[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface SagaDefinition {
  sagaId: string;
  correlationId: string;
  steps: Array<{
    name: string;
    execute: () => Promise<void>;
    compensate?: () => Promise<void>;
    metadata?: Record<string, unknown>;
  }>;
  execute(sagaState: SagaState, step: SagaStep): Promise<void>;
}

@Injectable()
export class SagaCoordinatorService {
  private readonly logger = new Logger(SagaCoordinatorService.name);
  private readonly activeSagas: Map<string, SagaState>;

  constructor(
    private readonly compensationHandler: CompensationHandler,
    private readonly retryStrategy: RetryStrategyService,
  ) {
    this.activeSagas = new Map();
  }

  async executeSaga(definition: SagaDefinition): Promise<SagaState> {
    const sagaState = this.initializeSagaState(definition);
    this.activeSagas.set(sagaState.sagaId, sagaState);

    this.logger.log(`Starting saga ${sagaState.sagaId} with ${definition.steps.length} steps`);

    try {
      for (let i = 0; i < definition.steps.length; i++) {
        const step = definition.steps[i];
        const sagaStep = sagaState.steps[i];
        
        await definition.execute(sagaState, sagaStep);
      }

      sagaState.status = SagaStepStatus.COMPLETED;
      sagaState.completedAt = new Date();
      this.logger.log(`Saga ${sagaState.sagaId} completed successfully`);
    } catch (error) {
      await this.handleSagaFailure(sagaState, error as Error);
    }

    return sagaState;
  }

  private initializeSagaState(definition: SagaDefinition): SagaState {
    return {
      sagaId: definition.sagaId || randomUUID(),
      correlationId: definition.correlationId,
      status: SagaStepStatus.PENDING,
      startedAt: new Date(),
      steps: definition.steps.map((step, index) => ({
        stepId: `${definition.sagaId}-step-${index}`,
        name: step.name,
        status: SagaStepStatus.PENDING,
        executeAction: step.execute,
        compensateAction: step.compensate,
        metadata: step.metadata,
      })),
    };
  }

  private async executeStep(
    sagaState: SagaState,
    sagaStep: SagaStep,
    definition: { execute: () => Promise<void> },
  ): Promise<void> {
    sagaStep.status = SagaStepStatus.EXECUTING;
    sagaState.status = SagaStepStatus.EXECUTING;

    this.logger.log(`Executing saga ${sagaState.sagaId} step: ${sagaStep.name}`);

    const shouldRetry = await this.retryStrategy.shouldRetry(
      sagaState.correlationId,
      sagaStep.name,
    );

    if (!shouldRetry) {
      throw new Error(
        `Too many retry attempts for step ${sagaStep.name} in saga ${sagaState.sagaId}`
      );
    }

    await this.retryStrategy.acquireLock(sagaState.correlationId, sagaStep.name);
    
    try {
      await definition.execute();
      sagaStep.status = SagaStepStatus.COMPLETED;
      this.logger.log(`Step ${sagaStep.name} completed successfully`);
    } catch (error) {
      sagaStep.status = SagaStepStatus.FAILED;
      throw error;
    } finally {
      await this.retryStrategy.releaseLock(sagaState.correlationId, sagaStep.name);
    }
  }

  async compensateAction(
    sagaState: SagaState,
    step: SagaStep,
  ): Promise<void> {
    if (!step.compensateAction) {
      return;
    }

    this.logger.log(`Compensating step ${step.name} in saga ${sagaState.sagaId}`);
    
    try {
      await step.compensateAction();
      step.status = SagaStepStatus.COMPENSATED;
    } catch (compensateError) {
      this.logger.error(
        `Compensation failed for step ${step.name}: ${compensateError}`
      );
      await this.compensationHandler.recordCompensationFailure(
        sagaState.sagaId,
        step.stepId,
        (compensateError as Error).message,
      );
    }
  }

  private async handleSagaFailure(sagaState: SagaState, error: Error): Promise<void> {
    this.logger.error(`Saga ${sagaState.sagaId} failed: ${error.message}`);
    sagaState.status = SagaStepStatus.COMPENSATING;
    sagaState.error = error.message;

    const completedSteps = sagaState.steps
      .filter(step => step.status === SagaStepStatus.COMPLETED)
      .reverse();

    for (const step of completedSteps) {
      if (step.compensateAction) {
        await this.compensateAction(sagaState, step);
      }
    }

    sagaState.status = SagaStepStatus.COMPENSATED;
    sagaState.completedAt = new Date();
    
    await this.compensationHandler.recordCompensation(
      sagaState.sagaId,
      sagaState.correlationId,
      error.message,
    );

    this.logger.warn(`Saga ${sagaState.sagaId} compensated`);
  }

  getSagaState(sagaId: string): SagaState | undefined {
    return this.activeSagas.get(sagaId);
  }

  getSagaByCorrelationId(correlationId: string): SagaState | undefined {
    for (const saga of this.activeSagas.values()) {
      if (saga.correlationId === correlationId) {
        return saga;
      }
    }
    return undefined;
  }

  getActiveSagas(): SagaState[] {
    return Array.from(this.activeSagas.values());
  }

  async abortSaga(sagaId: string): Promise<SagaState | undefined> {
    const sagaState = this.activeSagas.get(sagaId);
    if (!sagaState) {
      return undefined;
    }

    if (sagaState.status === SagaStepStatus.COMPLETED) {
      throw new Error(`Cannot abort completed saga ${sagaId}`);
    }

    await this.handleSagaFailure(sagaState, new Error('Saga aborted by user'));
    return sagaState;
  }

  async cleanupCompletedSagas(): Promise<number> {
    const completedSagas: string[] = [];
    
    for (const [sagaId, state] of this.activeSagas.entries()) {
      if (
        state.status === SagaStepStatus.COMPLETED ||
        state.status === SagaStepStatus.COMPENSATED
      ) {
        completedSagas.push(sagaId);
      }
    }

    for (const sagaId of completedSagas) {
      this.activeSagas.delete(sagaId);
    }

    return completedSagas.length;
  }
}

// === ARCHIVO: src/infrastructure/saga/compensations/compensation.handler.ts ===
import { Injectable, Logger } from '@nestjs/common';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';
import { OutboxRepository } from '@infrastructure/outbox/outbox.repository';
import { SQSProducerService } from '@infrastructure/message-brokers/sqs/sqs-producer.service';

export enum CompensationStep {
  REVERT_CREDIT_ORIGINATION = 'REVERT_CREDIT_ORIGINATION',
  MARK_FRAUD_ALERT = 'MARK_FRAUD_ALERT',
  NOTIFY_ORIGINATOR = 'NOTIFY_ORIGINATOR',
  RELEASE_RESERVED_FUNDS = 'RELEASE_RESERVED_FUNDS',
}

export interface CompensationContext {
  readonly sagaId: string;
  readonly correlationId: string;
  readonly stepThatFailed: CompensationStep;
  readonly originalEvent: CreditOriginatedEvent | FraudCheckedEvent;
  readonly failureReason: string;
  readonly timestamp: Date;
}

export interface CompensationResult {
  readonly success: boolean;
  readonly compensationId: string;
  readonly stepsExecuted: CompensationStep[];
  readonly errors: string[];
}

interface CompensationStepQueue {
  push(step: CompensationStep): void;
  join(): Promise<void>;
}

@Injectable()
export class CompensationHandler {
  private readonly logger = new Logger(CompensationHandler.name);
  private readonly compensationRecords: Map<string, {
    sagaId: string;
    correlationId: string;
    errors: string[];
    timestamp: Date;
  }>;
  private readonly stepQueue: CompensationStepQueue[];

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly sqsProducer: SQSProducerService,
  ) {
    this.compensationRecords = new Map();
    this.stepQueue = [];
  }

  async recordCompensation(
    sagaId: string,
    correlationId: string,
    errorMessage: string,
  ): Promise<string> {
    const compensationId = `COMP-${sagaId}-${Date.now()}`;
    
    this.compensationRecords.set(compensationId, {
      sagaId,
      correlationId,
      errors: [errorMessage],
      timestamp: new Date(),
    });

    this.logger.log(`Compensation recorded for saga ${sagaId}: ${compensationId}`);
    return compensationId;
  }

  async recordCompensationFailure(
    sagaId: string,
    stepId: string,
    errorMessage: string,
  ): Promise<void> {
    this.logger.error(
      `Compensation failure for saga ${sagaId}, step ${stepId}: ${errorMessage}`
    );

    const failureRecord = {
      sagaId,
      stepId,
      error: errorMessage,
      timestamp: new Date(),
    };

    await this.outboxRepository.save({
      id: `COMP-FAILURE-${sagaId}-${stepId}-${Date.now()}`,
      aggregateType: 'SagaCompensationFailure',
      aggregateId: sagaId,
      eventType: 'CompensationFailureRecorded',
      payload: failureRecord as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: sagaId,
      version: 1,
    });
  }

  async handleCompensation(context: CompensationContext): Promise<CompensationResult> {
    const stepsExecuted: CompensationStep[] = [];
    const errors: string[] = [];

    this.logger.warn(
      `Initiating compensation for saga ${context.sagaId} after failure at step ${context.stepThatFailed}`,
    );

    try {
      if (context.originalEvent instanceof CreditOriginatedEvent) {
        const creditId = context.originalEvent.getCreditId();
        
        await this.revertCreditOrigination(creditId, context);
        stepsExecuted.push(CompensationStep.REVERT_CREDIT_ORIGINATION);

        await this.notifyOriginatorOfFailure(creditId, context);
        stepsExecuted.push(CompensationStep.NOTIFY_ORIGINATOR);

        await this.releaseReservedFunds(creditId, context);
        stepsExecuted.push(CompensationStep.RELEASE_RESERVED_FUNDS);
      }

      if (context.originalEvent instanceof FraudCheckedEvent) {
        const fraudCheckId = context.originalEvent.getEventId();
        
        await this.markFraudAlert(fraudCheckId, context);
        stepsExecuted.push(CompensationStep.MARK_FRAUD_ALERT);
      }

      const compensationId = `COMP-${context.sagaId}-${Date.now()}`;
      
      await this.persistCompensationRecord(compensationId, context, stepsExecuted);

      this.logger.log(
        `Compensation completed successfully for saga ${context.sagaId}. Steps executed: ${stepsExecuted.join(', ')}`,
      );

      return {
        success: true,
        compensationId,
        stepsExecuted,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      this.logger.error(
        `Compensation failed for saga ${context.sagaId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        compensationId: `COMP-${context.sagaId}-FAILED`,
        stepsExecuted,
        errors,
      };
    }
  }

  private async revertCreditOrigination(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Reverting credit origination for credit ${creditId}`);
    
    const compensationPayload = {
      action: 'REVERT_CREDIT',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      reason: context.failureReason,
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-${creditId}-${Date.now()}`,
      aggregateType: 'Credit',
      aggregateId: creditId,
      eventType: 'CreditReversedEvent',
      payload: compensationPayload as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });

    this.logger.debug(`Credit reversal queued for credit ${creditId}`);
  }

  private async markFraudAlert(
    fraudCheckId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Marking fraud alert for check ${fraudCheckId}`);
    
    const fraudAlertPayload = {
      action: 'MARK_FRAUD',
      fraudCheckId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      reason: context.failureReason,
      severity: 'HIGH',
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-FRAUD-${fraudCheckId}-${Date.now()}`,
      aggregateType: 'FraudCheck',
      aggregateId: fraudCheckId,
      eventType: 'FraudAlertMarkedEvent',
      payload: fraudAlertPayload as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });

    await this.sqsProducer.sendMessage(
      'fraud-alerts-queue',
      fraudAlertPayload,
      { correlationId: context.correlationId },
    );
  }

  private async notifyOriginatorOfFailure(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Notifying originator of failure for credit ${creditId}`);
    
    const notificationPayload = {
      action: 'NOTIFY_FAILURE',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      message: `Credit origination failed: ${context.failureReason}`,
      timestamp: context.timestamp.toISOString(),
    };

    await this.sqsProducer.sendMessage(
      'originator-notifications-queue',
      notificationPayload,
      { correlationId: context.correlationId },
    );
  }

  private async releaseReservedFunds(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Releasing reserved funds for credit ${creditId}`);
    
    const releasePayload = {
      action: 'RELEASE_FUNDS',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-FUNDS-${creditId}-${Date.now()}`,
      aggregateType: 'Credit',
      aggregateId: creditId,
      eventType: 'FundsReleasedEvent',
      payload: releasePayload as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });
  }

  private async persistCompensationRecord(
    compensationId: string,
    context: CompensationContext,
    stepsExecuted: CompensationStep[],
  ): Promise<void> {
    const compensationRecord = {
      id: compensationId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      failedStep: context.stepThatFailed,
      failureReason: context.failureReason,
      executedSteps: stepsExecuted,
      executedAt: new Date(),
      status: 'COMPLETED',
    };

    await this.outboxRepository.save({
      id: compensationId,
      aggregateType: 'SagaCompensation',
      aggregateId: context.sagaId,
      eventType: 'SagaCompensationCompleted',
      payload: compensationRecord as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });
  }

  async canCompensate(step: CompensationStep): Promise<boolean> {
    const compensableSteps = [
      CompensationStep.REVERT_CREDIT_ORIGINATION,
      CompensationStep.MARK_FRAUD_ALERT,
      CompensationStep.NOTIFY_ORIGINATOR,
      CompensationStep.RELEASE_RESERVED_FUNDS,
    ];
    
    return compensableSteps.includes(step);
  }
}


// === ARCHIVO: src/infrastructure/saga/saga-coordinator.service.ts ===
export enum SagaStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATED = 'COMPENSATED',
}

export interface SagaStep {
  stepName: string;
  compensate?: () => Promise<void>;
  execute?: () => Promise<void>;
  status: SagaStepStatus;
  result?: unknown;
  error?: string;
}

export interface SagaState {
  sagaId: string;
  sagaType: string;
  correlationId: string;
  status: SagaStepStatus;
  steps: SagaStep[];
  startedAt: Date;
  completedAt?: Date;
  payload?: Record<string, unknown>;
  compensationActions?: Array<{ stepName: string; compensate: () => Promise<void> }>;
  currentStepIndex: number;
}

export interface SagaDefinition {
  sagaType: string;
  correlationId: string;
  payload?: Record<string, unknown>;
  steps: SagaStep[];
  compensationActions?: Array<{ stepName: string; compensate: () => Promise<void> }>;
}

export class SagaCoordinatorService {
  private readonly logger = new Logger(SagaCoordinatorService.name);
  private readonly activeSagas: Map<string, SagaState> = new Map();

  constructor() {}

  async executeSaga(definition: SagaDefinition): Promise<SagaState> {
    const sagaState = this.initializeSagaState(definition);
    this.activeSagas.set(sagaState.sagaId, sagaState);
    
    try {
      for (let i = 0; i < sagaState.steps.length; i++) {
        sagaState.currentStepIndex = i;
        const step = sagaState.steps[i];
        step.status = SagaStepStatus.IN_PROGRESS;
        
        if (step.execute) {
          step.result = await step.execute();
        }
        step.status = SagaStepStatus.COMPLETED;
      }
      
      sagaState.status = SagaStepStatus.COMPLETED;
      sagaState.completedAt = new Date();
      this.logger.log(`Saga ${sagaState.sagaId} completed successfully`);
    } catch (error) {
      this.logger.error(`Saga ${sagaState.sagaId} failed: ${error instanceof Error ? error.message : String(error)}`);
      await this.handleSagaFailure(sagaState, error instanceof Error ? error : new Error(String(error)));
    }
    
    return sagaState;
  }

  async startSaga(definition: {
    sagaType: string;
    correlationId: string;
    payload?: Record<string, unknown>;
    compensationActions?: Array<{ stepName: string; compensate: () => Promise<void> }>;
  }): Promise<string> {
    const sagaId = `saga-${definition.correlationId}-${Date.now()}`;
    
    const sagaState: SagaState = {
      sagaId,
      sagaType: definition.sagaType,
      correlationId: definition.correlationId,
      status: SagaStepStatus.PENDING,
      steps: [],
      startedAt: new Date(),
      payload: definition.payload,
      compensationActions: definition.compensationActions,
      currentStepIndex: 0,
    };
    
    this.activeSagas.set(sagaId, sagaState);
    this.logger.log(`Started saga ${sagaId} for correlation ${definition.correlationId}`);
    
    return sagaId;
  }

  async processStep(params: {
    stepName: string;
    correlationId: string;
    result: 'SUCCESS' | 'FAILURE' | 'MANUAL_REVIEW';
    data?: Record<string, unknown>;
  }): Promise<void> {
    const sagaState = this.getSagaByCorrelationId(params.correlationId);
    
    if (!sagaState) {
      this.logger.warn(`Saga not found for correlation ${params.correlationId}`);
      return;
    }
    
    const step = sagaState.steps.find(s => s.stepName === params.stepName);
    if (step) {
      step.result = params.data;
      step.status = params.result === 'SUCCESS' ? SagaStepStatus.COMPLETED : 
                    params.result === 'MANUAL_REVIEW' ? SagaStepStatus.PENDING : 
                    SagaStepStatus.FAILED;
      this.logger.log(`Processed step ${params.stepName} in saga ${sagaState.sagaId} with result ${params.result}`);
    }
  }

  async compensate(params: {
    correlationId: string;
    stepName: string;
    reason: string;
  }): Promise<void> {
    const sagaState = this.getSagaByCorrelationId(params.correlationId);
    
    if (!sagaState) {
      this.logger.warn(`Saga not found for correlation ${params.correlationId}`);
      return;
    }
    
    const compensationActions = sagaState.compensationActions || [];
    const actionToCompensate = compensationActions.find(a => a.stepName === params.stepName);
    
    if (actionToCompensate) {
      try {
        await actionToCompensate.compensate();
        this.logger.log(`Compensated step ${params.stepName} in saga ${sagaState.sagaId}`);
      } catch (error) {
        this.logger.error(`Failed to compensate step ${params.stepName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    sagaState.status = SagaStepStatus.COMPENSATED;
    this.logger.warn(`Saga ${sagaState.sagaId} compensated due to: ${params.reason}`);
  }

  private initializeSagaState(definition: SagaDefinition): SagaState {
    return {
      sagaId: `saga-${definition.correlationId}-${Date.now()}`,
      sagaType: definition.sagaType,
      correlationId: definition.correlationId,
      status: SagaStepStatus.PENDING,
      steps: definition.steps || [],
      startedAt: new Date(),
      payload: definition.payload,
      compensationActions: definition.compensationActions,
      currentStepIndex: 0,
    };
  }

  private async executeStep(sagaState: SagaState, step: SagaStep, index: number): Promise<void> {
    step.status = SagaStepStatus.IN_PROGRESS;
    sagaState.currentStepIndex = index;
    
    if (step.execute) {
      step.result = await step.execute();
    }
    
    step.status = SagaStepStatus.COMPLETED;
  }

  private async handleSagaFailure(sagaState: SagaState, error: Error): Promise<void> {
    sagaState.status = SagaStepStatus.FAILED;
    
    const compensationActions = sagaState.compensationActions || [];
    for (const action of compensationActions) {
      try {
        await action.compensate();
      } catch (compError) {
        this.logger.error(`Compensation failed for ${action.stepName}: ${compError instanceof Error ? compError.message : String(compError)}`);
      }
    }
  }

  private async compensateStep(sagaState: SagaState, step: SagaStep): Promise<void> {
    if (step.compensate) {
      step.status = SagaStepStatus.IN_PROGRESS;
      await step.compensate();
      step.status = SagaStepStatus.COMPENSATED;
    }
  }

  getSagaState(sagaId: string): SagaState | undefined {
    return this.activeSagas.get(sagaId);
  }

  getSagaByCorrelationId(correlationId: string): SagaState | undefined {
    for (const saga of this.activeSagas.values()) {
      if (saga.correlationId === correlationId) {
        return saga;
      }
    }
    return undefined;
  }

  getActiveSagas(): SagaState[] {
    return Array.from(this.activeSagas.values());
  }

  async abortSaga(sagaId: string): Promise<SagaState | undefined> {
    const sagaState = this.activeSagas.get(sagaId);
    if (sagaState) {
      sagaState.status = SagaStepStatus.COMPENSATED;
      this.logger.warn(`Saga ${sagaId} aborted`);
    }
    return sagaState;
  }

  async cleanupCompletedSagas(): Promise<number> {
    let cleaned = 0;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [id, saga] of this.activeSagas.entries()) {
      const age = now - saga.startedAt.getTime();
      if (age > maxAge && (saga.status === SagaStepStatus.COMPLETED || saga.status === SagaStepStatus.COMPENSATED)) {
        this.activeSagas.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// === ARCHIVO: src/domain/events/fraud-checked.event.ts ===
export enum FraudRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FraudCheckStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
}

export interface FraudCheckResult {
  readonly status: FraudCheckStatus;
  readonly riskLevel: FraudRiskLevel;
  readonly fraudScore: number;
  readonly checksPerformed: ReadonlyArray<string>;
  readonly flags: ReadonlyArray<string>;
  readonly recommendation: 'APPROVE' | 'REVIEW' | 'REJECT';
}

export interface FraudCheckBreakdown {
  readonly identityVerification: boolean;
  readonly addressVerification: boolean;
  readonly incomeVerification: boolean;
  readonly creditBureauCheck: boolean;
  readonly velocityCheck: boolean;
  readonly deviceFingerprintCheck: boolean;
  readonly biometricVerification: boolean;
}

export interface FraudCheckedEventMetadata {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly version: string;
  readonly correlationId: string;
  readonly causationId: string;
}

export interface FraudCheckedEventData {
  readonly creditId: string;
  readonly applicantId: string;
  readonly fraudCheckId: string;
  readonly result: FraudCheckResult;
  readonly breakdown: FraudCheckBreakdown;
  readonly checkedBy: string;
  readonly processingTimeMs: number;
}

export class FraudCheckedEvent {
  readonly eventType = 'FraudChecked';
  readonly metadata: FraudCheckedEventMetadata;
  readonly data: FraudCheckedEventData;

  private constructor(metadata: FraudCheckedEventMetadata, data: FraudCheckedEventData) {
    this.metadata = metadata;
    this.data = data;
  }

  static create(
    creditId: string,
    applicantId: string,
    fraudCheckId: string,
    result: FraudCheckResult,
    breakdown: FraudCheckBreakdown,
    checkedBy: string,
    processingTimeMs: number,
    correlationId: string,
  ): FraudCheckedEvent {
    const metadata: FraudCheckedEventMetadata = {
      eventId: `evt-fraud-${fraudCheckId}-${Date.now()}`,
      occurredAt: new Date(),
      version: '1.0.0',
      correlationId,
      causationId: creditId,
    };

    const data: FraudCheckedEventData = {
      creditId,
      applicantId,
      fraudCheckId,
      result,
      breakdown,
      checkedBy,
      processingTimeMs,
    };

    return new FraudCheckedEvent(metadata, data);
  }

  static fromPayload(payload: Record<string, unknown>): FraudCheckedEvent {
    const metadata: FraudCheckedEventMetadata = {
      eventId: payload.eventId as string,
      occurredAt: new Date(payload.occurredAt as string),
      version: payload.version as string,
      correlationId: payload.correlationId as string,
      causationId: payload.causationId as string,
    };

    const data: FraudCheckedEventData = {
      creditId: payload.creditId as string,
      applicantId: payload.applicantId as string,
      fraudCheckId: payload.fraudCheckId as string,
      result: payload.result as FraudCheckResult,
      breakdown: payload.breakdown as FraudCheckBreakdown,
      checkedBy: payload.checkedBy as string,
      processingTimeMs: payload.processingTimeMs as number,
    };

    return new FraudCheckedEvent(metadata, data);
  }

  getEventId(): string {
    return this.metadata.eventId;
  }

  getCreditId(): string {
    return this.data.creditId;
  }

  getCorrelationId(): string {
    return this.metadata.correlationId;
  }

  getOccurredAt(): Date {
    return this.metadata.occurredAt;
  }

  getRiskLevel(): FraudRiskLevel {
    return this.data.result.riskLevel;
  }

  getStatus(): FraudCheckStatus {
    return this.data.result.status;
  }

  getFraudScore(): number {
    return this.data.result.fraudScore;
  }

  getPurpose(): string {
    return (this.data.result.checksPerformed[0] || 'general').toUpperCase();
  }

  getAmount(): number {
    return this.data.processingTimeMs;
  }

  isHighValue(): boolean {
    return this.data.result.fraudScore > 75;
  }

  isHighRiskApplicant(): boolean {
    return this.data.result.riskLevel === FraudRiskLevel.HIGH || 
           this.data.result.riskLevel === FraudRiskLevel.CRITICAL ||
           this.data.result.recommendation === 'REJECT';
  }

  isApproved(): boolean {
    return this.data.result.recommendation === 'APPROVE';
  }

  isRejected(): boolean {
    return this.data.result.recommendation === 'REJECT';
  }

  requiresManualReview(): boolean {
    return this.data.result.recommendation === 'REVIEW';
  }

  isHighRisk(): boolean {
    return this.data.result.riskLevel === FraudRiskLevel.HIGH ||
           this.data.result.riskLevel === FraudRiskLevel.CRITICAL;
  }

  getRecommendation(): string {
    return this.data.result.recommendation;
  }

  getChecksPerformed(): ReadonlyArray<string> {
    return this.data.result.checksPerformed;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: {
        ...this.metadata,
        occurredAt: this.metadata.occurredAt.toISOString(),
      },
      data: this.data,
    };
  }
}

// === ARCHIVO: src/infrastructure/outbox/outbox.repository.ts ===
export interface OutboxMessageFilter {
  readonly status?: 'pending' | 'processed' | 'failed';
  readonly eventType?: string;
  readonly fromDate?: Date;
  readonly toDate?: Date;
  readonly limit?: number;
}

export interface OutboxMessage {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: Date;
  readonly status: 'pending' | 'processed' | 'failed';
  readonly retryCount?: number;
}

export interface OutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  saveBatch(messages: OutboxMessage[]): Promise<void>;
  findPending(limit: number): Promise<OutboxMessage[]>;
  findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]>;
  markAsProcessed(messageId: string): Promise<void>;
  markAsFailed(messageId: string, error: string): Promise<void>;
  markAsDeadLetter(messageId: string): Promise<void>;
  existsByEventId(eventId: string): Promise<boolean>;
  updateRetryCount(messageId: string): Promise<void>;
  incrementRetryCount(messageId: string): Promise<void>;
  deleteOldProcessedMessages(olderThan: Date): Promise<number>;
}

export abstract class OutboxRepositoryBase implements OutboxRepository {
  abstract save(message: OutboxMessage): Promise<void>;
  abstract saveBatch(messages: OutboxMessage[]): Promise<void>;
  abstract findPending(limit: number): Promise<OutboxMessage[]>;
  abstract findByFilter(filter: OutboxMessageFilter): Promise<OutboxMessage[]>;
  abstract markAsProcessed(messageId: string): Promise<void>;
  abstract markAsFailed(messageId: string, error: string): Promise<void>;
  abstract markAsDeadLetter(messageId: string): Promise<void>;
  abstract existsByEventId(eventId: string): Promise<boolean>;
  abstract updateRetryCount(messageId: string): Promise<void>;
  abstract incrementRetryCount(messageId: string): Promise<void>;
  abstract deleteOldProcessedMessages(olderThan: Date): Promise<number>;

  protected validateMessage(message: OutboxMessage): void {
    if (!message.id) throw new Error('Outbox message must have an id');
    if (!message.aggregateId) throw new Error('Outbox message must have an aggregateId');
    if (!message.eventType) throw new Error('Outbox message must have an eventType');
  }
}
```
