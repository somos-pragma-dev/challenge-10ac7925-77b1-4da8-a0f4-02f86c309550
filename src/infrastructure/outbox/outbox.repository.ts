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