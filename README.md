# Diseño y justificación de una arquitectura event-driven con outbox pattern y saga distribuida

Como ingeniero senior en un equipo de backend distribuido, tu tarea es diseñar y justificar una arquitectura event-driven que utilice el outbox pattern y una saga distribuida. Debes asegurar la consistencia eventual, manejar la backpressure, garantizar la idempotencia, y comparar Kafka vs SQS FIFO en términos de exactly-once vs at-least-once. Además, debes implementar el manejo de compensaciones en la saga, retries con backoff exponencial + jitter, y estrategias para evitar el thundering herd. El sistema debe procesar eventos generados por un originador de créditos y un motor antifraude, y persistirlos en DynamoDB y PostgreSQL.

## Informacion General

| Campo | Valor |
|-------|-------|
| **Tema** | arquitectura event-driven con outbox pattern y saga distribuida |
| **Nivel** | senior-l3 |
| **Tipo** | practical |
| **Tiempo estimado** | 15 horas |

## Fases del Reto

### Fase 0: Configuración del Proyecto

**Objetivo:** Obtener el proyecto base funcional enviando el Código Base a un asistente de IA, que lo analizará, corregirá errores y generará un ZIP listo para usar.

**Tiempo estimado:** 15-30 minutos

**Instrucciones:**

- Asegúrate de tener instalado para ejecutar el proyecto: Node.js 18+, npm, VS Code o similar.
- Copia todo el contenido del campo **Código Base** de este reto — incluyendo el texto de instrucciones que aparece al inicio.
- Abre un asistente de IA (Claude en claude.ai, ChatGPT o Gemini — se recomienda Claude), pega el contenido copiado en el chat y envíalo.
- El asistente analizará los archivos, corregirá errores y generará un archivo ZIP descargable. Descárgalo y extráelo en la carpeta donde quieras trabajar.
- Ejecuta `npm install && npm run build` (o `npm start`). Si no hay errores, estás listo.

**Entregable:** El proyecto compila/arranca sin errores.

<details>
<summary>Pistas de conocimiento</summary>

- Copia el Código Base completo incluyendo el texto de instrucciones al inicio — esas instrucciones le indican al asistente exactamente qué hacer con los archivos.
- Si el asistente no genera el ZIP automáticamente al terminar el análisis, escríbele: "genera el ZIP ahora".
- Si el proyecto tiene errores al arrancar, comparte el mensaje de error con el mismo asistente para que lo corrija.

</details>

### Fase 1: Exploración y modelado del dominio

**Objetivo:** Identificar y modelar los eventos y actores clave en el dominio de la banca y el procesamiento de créditos.

**Tiempo estimado:** 3 horas

**Instrucciones:**

- Identifica los eventos generados por el originador de créditos y el motor antifraude.
- Modela los actores involucrados en el procesamiento de estos eventos.
- Define las propiedades operativas clave (consistencia, latencia, disponibilidad) y sus umbrales.

**Entregable:** Modelo del dominio con eventos, actores y propiedades operativas.

<details>
<summary>Pistas de conocimiento</summary>

- Considera las diferencias entre eventos transaccionales y analíticos.
- Piensa en cómo los eventos se relacionan con los estados del sistema.

</details>

### Fase 2: Implementación del outbox pattern

**Objetivo:** Implementar el outbox pattern para garantizar la consistencia eventual y la idempotencia en el procesamiento de eventos.

**Tiempo estimado:** 4 horas

**Instrucciones:**

- Diseña e implementa el outbox pattern para persistir eventos en DynamoDB y PostgreSQL.
- Asegura que el sistema maneje la backpressure y evite el thundering herd.
- Define y aplica la idempotencia en la persistencia de eventos.

**Entregable:** Implementación del outbox pattern con garantías de consistencia eventual y idempotencia.

<details>
<summary>Pistas de conocimiento</summary>

- Considera el uso de tablas de outbox en DynamoDB y PostgreSQL.
- Piensa en estrategias para manejar la backpressure y evitar el thundering herd.

</details>

### Fase 3: Comparación de Kafka vs SQS FIFO

**Objetivo:** Comparar Kafka vs SQS FIFO en términos de exactly-once vs at-least-once y otras propiedades operativas.

**Tiempo estimado:** 3 horas

**Instrucciones:**

- Compara Kafka vs SQS FIFO en al menos 4 aspectos (consistencia, latencia, escalabilidad, fault tolerance).
- Discute las implicaciones de exactly-once vs at-least-once en cada sistema.
- Proporciona una recomendación fundamentada basada en la comparación.

**Entregable:** Comparación detallada de Kafka vs SQS FIFO con recomendación fundamentada.

<details>
<summary>Pistas de conocimiento</summary>

- Investiga las características y limitaciones de Kafka y SQS FIFO.
- Considera casos de uso específicos para cada sistema.

</details>

### Fase 4: Implementación de la saga distribuida

**Objetivo:** Implementar una saga distribuida para manejar compensaciones y retries con backoff exponencial + jitter.

**Tiempo estimado:** 5 horas

**Instrucciones:**

- Diseña e implementa una saga distribuida para manejar compensaciones en el procesamiento de eventos.
- Implementa retries con backoff exponencial + jitter para manejar fallos transitorios.
- Asegura que el sistema maneje correctamente los edge cases y errores del dominio.

**Entregable:** Implementación de la saga distribuida con manejo de compensaciones y retries.

<details>
<summary>Pistas de conocimiento</summary>

- Considera el uso de un coordinador de sagas para orquestar las compensaciones.
- Piensa en estrategias para manejar edge cases y errores del dominio.

</details>

## Dimensiones Evaluadas

- **queEs**: ¿Qué es el outbox pattern y cómo se aplica en este reto?
- **paraQueSirve**: ¿Para qué sirve comparar Kafka vs SQS FIFO en este contexto?
- **comoSeUsa**: ¿Cómo se usa el outbox pattern para garantizar la consistencia eventual y la idempotencia?
- **erroresComunes**: ¿Cuáles son los errores comunes al implementar una saga distribuida y cómo se evitan?
- **queDecisionesImplica**: ¿Qué decisiones implica la elección entre Kafka y SQS FIFO en términos de consistencia y latencia?

## Criterios de Evaluacion

- Modelo del dominio con eventos, actores y propiedades operativas.
- Implementación del outbox pattern con garantías de consistencia eventual y idempotencia.
- Comparación detallada de Kafka vs SQS FIFO con recomendación fundamentada.
- Implementación de la saga distribuida con manejo de compensaciones y retries.

## Como trabajar con un asistente de IA

Hay dos caminos, elegi uno:

- **AGENTS.md** (recomendado) — instrucciones nativas del repo. Abri esta carpeta con tu agente local (Claude Code, Cursor, Codex, Copilot, Gemini) y las carga solo. Sabe que archivos faltan y con que comando se verifica, y completa el scaffold escribiendo en disco.
- **PROMPT_MEJORA.md** — para copiar y pegar en un chat (claude.ai, ChatGPT). Devuelve un ZIP con el proyecto. Sirve si no tenes un agente en el IDE.

Ninguno de los dos resuelve las fases del reto: eso es tu trabajo.

## Verificacion

El proyecto esta listo para trabajar cuando este comando corre sin errores:

```bash
el comando de build o arranque canonico del stack elegido
```

---

*Reto generado automaticamente por Challenge Generator - Pragma*
