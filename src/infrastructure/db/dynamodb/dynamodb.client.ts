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