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