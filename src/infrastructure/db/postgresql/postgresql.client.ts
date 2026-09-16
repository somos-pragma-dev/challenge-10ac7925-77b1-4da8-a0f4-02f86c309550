import { Pool, PoolConfig, PoolClient, QueryResult, QueryConfig, DatabaseError } from 'pg';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

export interface PostgreSQLConnectionConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
  readonly ssl: boolean;
  readonly sslMode?: 'disable' | 'require' | 'verify-ca' | 'verify-full';
  readonly applicationName: string;
}

export interface PostgreSQLPoolConfig {
  readonly max: number;
  readonly min: number;
  readonly idleTimeoutMillis: number;
  readonly connectionTimeoutMillis: number;
  readonly statementTimeoutMillis: number;
  readonly queryTimeoutMillis: number;
  readonly idleTransactionTimeoutSeconds: number;
  readonly maxLifetimeSeconds: number;
}

export interface PostgreSQLTransactionConfig {
  readonly isolationLevel: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  readonly deferrable: boolean;
  readonly readOnly: boolean;
}

export interface PostgreSQLClientMetrics {
  readonly totalConnections: number;
  readonly idleConnections: number;
  readonly waitingClients: number;
  readonly activeQueries: number;
  readonly executedQueries: number;
  readonly failedQueries: number;
  readonly averageQueryDurationMs: number;
  readonly longestQueryDurationMs: number;
}

class QueryMetricsCollector {
  private executedQueries = 0;
  private failedQueries = 0;
  private totalDurationMs = 0;
  private longestDurationMs = 0;
  private queryDurations: number[] = [];
  private readonly maxSamples = 1000;

  recordSuccess(durationMs: number): void {
    this.executedQueries++;
    this.totalDurationMs += durationMs;
    this.queryDurations.push(durationMs);

    if (durationMs > this.longestDurationMs) {
      this.longestDurationMs = durationMs;
    }

    if (this.queryDurations.length > this.maxSamples) {
      this.queryDurations.shift();
    }
  }

  recordFailure(): void {
    this.failedQueries++;
  }

  getMetrics(): Pick<PostgreSQLClientMetrics, 'executedQueries' | 'failedQueries' | 'averageQueryDurationMs' | 'longestQueryDurationMs'> {
    const averageDuration = this.queryDurations.length > 0
      ? this.totalDurationMs / this.queryDurations.length
      : 0;

    return {
      executedQueries: this.executedQueries,
      failedQueries: this.failedQueries,
      averageQueryDurationMs: Math.round(averageDuration),
      longestQueryDurationMs: Math.round(this.longestDurationMs),
    };
  }

  reset(): void {
    this.executedQueries = 0;
    this.failedQueries = 0;
    this.totalDurationMs = 0;
    this.longestDurationMs = 0;
    this.queryDurations = [];
  }
}

export class PostgreSQLClientWrapper extends EventEmitter {
  private readonly pool: Pool;
  private readonly configService: ConfigService;
  private readonly metricsCollector: QueryMetricsCollector;
  private readonly poolConfig: PostgreSQLPoolConfig;
  private isHealthy = true;
  private lastHealthCheck = Date.now();

  constructor(configService: ConfigService) {
    super();
    this.configService = configService;
    this.metricsCollector = new QueryMetricsCollector();
    this.poolConfig = this.getPoolConfig();

    const connectionConfig = this.getConnectionConfig();
    const poolConfig: PoolConfig = {
      ...connectionConfig,
      max: this.poolConfig.max,
      min: this.poolConfig.min,
      idleTimeoutMillis: this.poolConfig.idleTimeoutMillis,
      connectionTimeoutMillis: this.poolConfig.connectionTimeoutMillis,
      statement_timeout: this.poolConfig.statementTimeoutMillis,
      query_timeout: this.poolConfig.queryTimeoutMillis,
      idle_in_transaction_session_timeout: this.poolConfig.idleTransactionTimeoutSeconds * 1000,
      max_lifetime: this.poolConfig.maxLifetimeSeconds * 1000,
      application_name: connectionConfig.applicationName,
    };

    this.pool = new Pool(poolConfig);

    this.setupPoolEventHandlers();
  }

  private getConnectionConfig(): PostgreSQLConnectionConfig {
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    return {
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: this.configService.get<number>('POSTGRES_PORT', 5432),
      database: this.configService.get<string>('POSTGRES_DATABASE', 'credit_processing'),
      user: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      ssl: environment === 'production',
      sslMode: environment === 'production' ? 'require' : 'disable',
      applicationName: 'credit-processing-service',
    };
  }

  private getPoolConfig(): PostgreSQLPoolConfig {
    return {
      max: this.configService.get<number>('POSTGRES_POOL_MAX', 20),
      min: this.configService.get<number>('POSTGRES_POOL_MIN', 5),
      idleTimeoutMillis: this.configService.get<number>('POSTGRES_IDLE_TIMEOUT_MS', 30000),
      connectionTimeoutMillis: this.configService.get<number>('POSTGRES_CONNECTION_TIMEOUT_MS', 10000),
      statementTimeoutMillis: this.configService.get<number>('POSTGRES_STATEMENT_TIMEOUT_MS', 30000),
      queryTimeoutMillis: this.configService.get<number>('POSTGRES_QUERY_TIMEOUT_MS', 30000),
      idleTransactionTimeoutSeconds: this.configService.get<number>('POSTGRES_IDLE_TRANSACTION_TIMEOUT_SEC', 30),
      maxLifetimeSeconds: this.configService.get<number>('POSTGRES_MAX_LIFETIME_SEC', 1800),
    };
  }

  private setupPoolEventHandlers(): void {
    this.pool.on('error', (err: Error) => {
      this.emit('error', err);
      this.isHealthy = false;
    });

    this.pool.on('connect', (client: PoolClient) => {
      this.emit('connect', client);
    });

    this.pool.on('acquire', (client: PoolClient) => {
      this.emit('acquire', client);
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.emit('remove', client);
    });
  }

  async query<T = Record<string, unknown>>(
    text: string,
    values?: unknown[],
    config?: Partial<QueryConfig>
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await this.pool.query<T>({
        text,
        values,
        ...config,
      });

      const durationMs = Date.now() - startTime;
      this.metricsCollector.recordSuccess(durationMs);

      return result;
    } catch (error) {
      this.metricsCollector.recordFailure();
      this.handleQueryError(error, text, values);
      throw error;
    }
  }

  async queryWithRetry<T = Record<string, unknown>>(
    text: string,
    values?: unknown[],
    maxRetries: number = 3,
    retryDelayMs: number = 1000
  ): Promise<QueryResult<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.query<T>(text, values);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = retryDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof DatabaseError) {
      const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'HY000'];
      return retryableCodes.includes(error.code || '') || error.code?.startsWith('08') === true;
    }
    return false;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    transactionConfig?: Partial<PostgreSQLTransactionConfig>
  ): Promise<T> {
    const config: PostgreSQLTransactionConfig = {
      isolationLevel: transactionConfig?.isolationLevel || 'READ COMMITTED',
      deferrable: transactionConfig?.deferrable || false,
      readOnly: transactionConfig?.readOnly || false,
    };

    const client = await this.getClient();

    try {
      await client.query(`BEGIN ISOLATION LEVEL ${config.isolationLevel}`);

      if (config.deferrable) {
        await client.query('SET CONSTRAINTS ALL DEFERRED');
      }

      if (config.readOnly) {
        await client.query('SET TRANSACTION READ ONLY');
      }

      const result = await callback(client);

      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async withSavepoint<T>(
    savepointName: string,
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query(`SAVEPOINT ${savepointName}`);

      const result = await callback(client);

      await client.query(`RELEASE SAVEPOINT ${savepointName}`);

      return result;
    } catch (error) {
      await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      throw error;
    } finally {
      client.release();
    }
  }

  async executeInTransaction<T>(
    operations: Array<{ sql: string; values?: unknown[] }>
  ): Promise<T[]> {
    return this.withTransaction(async (client: PoolClient) => {
      const results: T[] = [];

      for (const operation of operations) {
        const result = await client.query<T>(operation.sql, operation.values);
        results.push(result.rows as T);
      }

      return results;
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1 as health_check');
      this.isHealthy = result.rows[0]?.health_check === 1;
      this.lastHealthCheck = Date.now();
      return this.isHealthy;
    } catch {
      this.isHealthy = false;
      return false;
    }
  }

  async checkConnection(): Promise<{ connected: boolean; latencyMs: number }> {
    const startTime = Date.now();

    try {
      await this.pool.query('SELECT 1');
      const latencyMs = Date.now() - startTime;

      return { connected: true, latencyMs };
    } catch {
      return { connected: false, latencyMs: -1 };
    }
  }

  getMetrics(): PostgreSQLClientMetrics {
    const poolMetrics = this.pool;

    return {
      totalConnections: poolMetrics.totalCount,
      idleConnections: poolMetrics.idleCount,
      waitingClients: poolMetrics.waitingCount,
      activeQueries: poolMetrics.totalCount - poolMetrics.idleCount,
      ...this.metricsCollector.getMetrics(),
    };
  }

  isHealthyState(): boolean {
    return this.isHealthy;
  }

  getLastHealthCheck(): Date {
    return new Date(this.lastHealthCheck);
  }

  getPoolConfig(): Readonly<PostgreSQLPoolConfig> {
    return this.poolConfig;
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  private handleQueryError(error: unknown, text: string, values?: unknown[]): void {
    if (error instanceof DatabaseError) {
      this.emit('queryError', {
        error,
        query: text,
        values,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
      });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const POSTGRES_CLIENT_TOKEN = 'POSTGRES_CLIENT';

export const createPostgreSQLClientProvider = {
  provide: POSTGRES_CLIENT_TOKEN,
  useFactory: (configService: ConfigService): PostgreSQLClientWrapper => {
    return new PostgreSQLClientWrapper(configService);
  },
  inject: [ConfigService],
};