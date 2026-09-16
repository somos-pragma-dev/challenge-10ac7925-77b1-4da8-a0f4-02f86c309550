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