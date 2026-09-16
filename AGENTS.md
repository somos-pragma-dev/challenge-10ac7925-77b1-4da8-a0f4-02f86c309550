# AGENTS.md

Instrucciones para el agente de IA que abra este repositorio (Claude Code, Cursor, Codex, Copilot, Gemini). Se cargan solas: no hay que pegar nada en ningun chat.

## Que es este repositorio

Es el codigo base de un reto de aprendizaje de Pragma: **Diseño y justificación de una arquitectura event-driven con outbox pattern y saga distribuida**.

| | |
|---|---|
| Tema | arquitectura event-driven con outbox pattern y saga distribuida |
| Nivel | senior-l3 |
| Chapter | Generico |
| Especialidad | Inferido del contexto |
| Stack | TypeScript / NestJS 10 |
| Patron arquitectonico | event-driven con outbox pattern y saga distribuida (orquestación con coordinador) |
| Tiempo estimado | 15 horas |

## Tu tarea

Dejar este proyecto en estado **verificable**: que el comando de verificacion corra sin errores. Escribi los archivos en disco, en este repositorio. No generes ZIPs ni archivos adjuntos.

En orden:

1. Corre `el comando de build o arranque canonico del stack elegido` y mira que falla.
2. Completa lo que falte de la lista de abajo: manifiesto de dependencias, punto de entrada, capa de interfaz y las capas del patron declarado.
3. Arregla SOLO los errores que impiden compilar o arrancar.
4. Volve a correr `el comando de build o arranque canonico del stack elegido` hasta que pase.
5. Pará ahí.

## Regla dura: las fases son trabajo del humano

**PROHIBIDO implementar los entregables de las fases.** El valor del reto esta en que la persona los resuelva. Tu trabajo es que tenga un proyecto que arranca; el hueco pedagogico se queda como esta.

No resuelvas nada de esto:

- **Fase 1 — Exploración y modelado del dominio**: Modelo del dominio con eventos, actores y propiedades operativas.
- **Fase 2 — Implementación del outbox pattern**: Implementación del outbox pattern con garantías de consistencia eventual y idempotencia.
- **Fase 3 — Comparación de Kafka vs SQS FIFO**: Comparación detallada de Kafka vs SQS FIFO con recomendación fundamentada.
- **Fase 4 — Implementación de la saga distribuida**: Implementación de la saga distribuida con manejo de compensaciones y retries.

Distincion operativa:

- **Arreglar** (si): import faltante, tipo que no existe, dependencia sin declarar, error de sintaxis, archivo referenciado que no existe.
- **No tocar** (no): logica de negocio incompleta, validaciones ausentes, secretos hardcodeados, APIs deprecadas que funcionan, concurrencia insegura, patrones mejorables. Eso es lo que la persona tiene que encontrar.

## Lo que falta y tenes que completar

### 1. Archivos que la arquitectura declara (3 de 32)

La propuesta arquitectonica del reto los lista y no llegaron al repo. Crealos con implementacion real, respetando la capa en la que viven:

- [ ] `test/unit/infrastructure/outbox/outbox.repository.spec.ts`
- [ ] `test/unit/infrastructure/saga/saga-coordinator.service.spec.ts`
- [ ] `test/integration/infrastructure/message-brokers/kafka-integration.spec.ts`

### 2. Referencias colgando (4)

Salieron de un analisis estatico del codigo que SI esta en el repo. Cada una rompe la compilacion:

- [ ] `src/infrastructure/outbox/dynamodb/dynamodb-outbox.repository.ts` — `OutboxMessage.map`
      Se invoca `map` sobre `OutboxMessage`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.
- [ ] `src/infrastructure/outbox/dynamodb/dynamodb-outbox.repository.ts` — `OutboxMessage.filter`
      Se invoca `filter` sobre `OutboxMessage`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.
- [ ] `src/infrastructure/saga/saga-coordinator.service.ts` — `SagaStep.execute`
      Se invoca `execute` sobre `SagaStep`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.
- [ ] `src/infrastructure/saga/saga-coordinator.service.ts` — `SagaStep.find`
      Se invoca `find` sobre `SagaStep`, pero esa clase no declara ese metodo. Agregalo con su implementacion real, o usa uno de los que si declara.

### Presentes (32)

- `tsconfig.json`
- `package.json`
- `src/main.ts`
- `src/domain/events/credit-originated.event.ts`
- `src/domain/events/fraud-checked.event.ts`
- `src/domain/actors/credit-originator.ts`
- `src/domain/actors/fraud-engine.ts`
- `src/domain/models/outbox-message.model.ts`
- `src/infrastructure/outbox/outbox.repository.ts`
- `src/infrastructure/outbox/dynamodb/dynamodb-outbox.repository.ts`
- `src/infrastructure/outbox/postgresql/postgresql-outbox.repository.ts`
- `src/infrastructure/message-brokers/message-broker.interface.ts`
- `src/infrastructure/message-brokers/kafka/kafka-producer.service.ts`
- `src/infrastructure/message-brokers/kafka/kafka-consumer.service.ts`
- `src/infrastructure/message-brokers/sqs/sqs-producer.service.ts`
- `src/infrastructure/message-brokers/sqs/sqs-consumer.service.ts`
- `src/infrastructure/saga/saga-coordinator.service.ts`
- `src/infrastructure/saga/compensations/compensation.handler.ts`
- `src/infrastructure/saga/retries/retry-strategy.service.ts`
- `src/infrastructure/config/aws.config.ts`
- `src/infrastructure/config/kafka.config.ts`
- `src/infrastructure/db/dynamodb/dynamodb.client.ts`
- `src/infrastructure/db/postgresql/postgresql.client.ts`
- `src/interfaces/http/credit.controller.ts`
- `src/interfaces/messaging/event-subscriber.ts`
- `src/application/services/event-publisher.service.ts`
- `src/application/use-cases/process-credit.usecase.ts`
- `src/app.module.ts`
- `test/e2e/application/process-credit.e2e-spec.ts`
- `docs/comparison-kafka-vs-sqs.md`
- `docs/domain-model.md`
- `docs/architecture-decision-record.md`

### Capas del patron declarado

Cada una tiene que existir como directorio real con al menos un archivo. Codigo plano en la raiz no satisface el patron.

- `src`
- `src/domain`
- `src/domain/events`
- `src/domain/actors`
- `src/domain/models`
- `src/infrastructure`
- `src/infrastructure/outbox`
- `src/infrastructure/outbox/dynamodb`
- `src/infrastructure/outbox/postgresql`
- `src/infrastructure/message-brokers`
- `src/infrastructure/message-brokers/kafka`
- `src/infrastructure/message-brokers/sqs`
- `src/infrastructure/saga`
- `src/infrastructure/saga/coordinator`
- `src/infrastructure/saga/compensations`
- `src/infrastructure/saga/retries`
- `src/infrastructure/config`
- `src/infrastructure/db`
- `src/infrastructure/db/dynamodb`
- `src/infrastructure/db/postgresql`
- `src/application`
- `src/application/services`
- `src/application/use-cases`
- `src/interfaces`
- `src/interfaces/http`
- `src/interfaces/messaging`
- `test`
- `test/unit`
- `test/integration`
- `test/e2e`

## Verificacion

```bash
el comando de build o arranque canonico del stack elegido
```

Ese comando pasando es la definicion de "terminado" para vos.

## Convenciones que tenes que respetar

- Un solo ecosistema: no declares librerias de otro lenguaje ni mezcles gestores de paquetes.
- Toda libreria que uses tiene que estar declarada en el manifiesto de dependencias.
- Todo import declarado tiene que usarse; todo tipo usado tiene que existir o venir de una dependencia declarada.
- El patron es **event-driven con outbox pattern y saga distribuida (orquestación con coordinador)**: los contratos (interfaces, puertos) los define la capa interna y los implementa la externa, nunca al revés.
- Los archivos que crees llevan implementacion real, no stubs: sin `TODO`, sin cuerpos vacios, sin `// getters y setters`.

## Contexto del candidato

Sirve para calibrar el nivel del codigo, no para resolver las fases.

- Brecha que el reto ataca: Ingeniero SeniorL3 con 8+ años en backend distribuido. Stack: TypeScript, Node.js 22, Kafka, SQS FIFO, DynamoDB, PostgreSQL. Debe justificar consistencia eventual, backpressure, idempotencia, exactly-once vs at-least-once. Comparar Kafka vs SQS FIFO en al menos 4 fases del reto. Incluir manejo de compensaciones en la saga, retries con backoff exponencial + jitter, y cómo evitar thundering herd. El reto debe forzar decisiones no triviales.

---

*Generado por Challenge Generator — Pragma. `README.md` tiene el enunciado completo del reto para la persona. `PROMPT_MEJORA.md` es la variante para pegar en un chat, si se prefiere ese flujo.*
