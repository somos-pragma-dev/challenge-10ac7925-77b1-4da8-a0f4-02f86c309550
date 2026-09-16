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