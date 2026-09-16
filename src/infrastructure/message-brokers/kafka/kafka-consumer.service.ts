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