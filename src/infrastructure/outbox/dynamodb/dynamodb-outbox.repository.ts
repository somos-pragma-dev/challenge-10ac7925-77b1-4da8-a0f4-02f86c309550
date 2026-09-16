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