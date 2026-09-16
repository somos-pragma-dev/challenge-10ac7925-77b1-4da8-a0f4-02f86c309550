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