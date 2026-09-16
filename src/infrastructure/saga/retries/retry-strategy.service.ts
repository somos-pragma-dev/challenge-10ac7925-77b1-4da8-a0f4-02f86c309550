import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RetryConfig {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly jitter: 'full' | 'decorrelated' | 'none';
  readonly retryableErrors: ReadonlyArray<string>;
}

export interface RetryContext {
  readonly operationId: string;
  readonly sagaId: string;
  readonly correlationId: string;
  readonly operationType: string;
  readonly attemptNumber: number;
  readonly lastError?: string;
}

export interface RetryResult<T> {
  readonly success: boolean;
  readonly result?: T;
  readonly attempts: number;
  readonly totalTimeMs: number;
  readonly errors: string[];
}

@Injectable()
export class RetryStrategyService {
  private readonly logger = new Logger(RetryStrategyService.name);
  private readonly defaultConfig: RetryConfig;
  private readonly operationConfigs: Map<string, RetryConfig>;
  private readonly locks: Map<string, { lockedAt: Date; expiresAt: Date }>;

  constructor(private readonly configService: ConfigService) {
    this.defaultConfig = {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      jitter: 'full',
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'],
    };
    this.operationConfigs = new Map();
    this.locks = new Map();
  }

  async shouldRetry(correlationId: string, stepName: string): Promise<boolean> {
    const lockKey = `${correlationId}:${stepName}`;
    const lock = this.locks.get(lockKey);
    
    if (lock) {
      const now = new Date();
      if (lock.expiresAt > now) {
        this.logger.debug(`Lock still active for ${lockKey}, allowing retry`);
        return true;
      }
      this.locks.delete(lockKey);
    }
    
    return true;
  }

  async acquireLock(correlationId: string, stepName: string): Promise<boolean> {
    const lockKey = `${correlationId}:${stepName}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30000);
    
    const existingLock = this.locks.get(lockKey);
    if (existingLock && existingLock.expiresAt > now) {
      this.logger.warn(`Lock already held for ${lockKey}`);
      return false;
    }
    
    this.locks.set(lockKey, { lockedAt: now, expiresAt });
    this.logger.debug(`Lock acquired for ${lockKey}`);
    return true;
  }

  async releaseLock(correlationId: string, stepName: string): Promise<void> {
    const lockKey = `${correlationId}:${stepName}`;
    this.locks.delete(lockKey);
    this.logger.debug(`Lock released for ${lockKey}`);
  }

  private resolveConfig(operationType: string, customConfig?: Partial<RetryConfig>): RetryConfig {
    const operationConfig = this.operationConfigs.get(operationType);
    return {
      ...this.defaultConfig,
      ...operationConfig,
      ...customConfig,
    };
  }

  private createDelayGenerator(
    config: RetryConfig,
  ): (attempt: number) => number {
    return (attempt: number): number => {
      let delay = Math.min(
        config.initialDelayMs * Math.pow(2, attempt),
        config.maxDelayMs,
      );

      if (config.jitter === 'full') {
        delay = delay * (0.5 + Math.random() * 0.5);
      } else if (config.jitter === 'decorrelated') {
        delay = delay * (0.5 + Math.random());
      }

      return Math.floor(delay);
    };
  }

  private isRetryableError(error: string, retryableErrors: ReadonlyArray<string>): boolean {
    return retryableErrors.some((retryable) => error.includes(retryable));
  }

  getConfigForOperation(operationType: string): RetryConfig {
    return this.operationConfigs.get(operationType) || this.defaultConfig;
  }

  isOperationRetryable(operationType: string): boolean {
    const config = this.getConfigForOperation(operationType);
    return config.maxAttempts > 0;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: RetryContext,
    customConfig?: Partial<RetryConfig>,
  ): Promise<RetryResult<T>> {
    const config = this.resolveConfig(context.operationType, customConfig);
    const delayGenerator = this.createDelayGenerator(config);
    const errors: string[] = [];
    const startTime = Date.now();

    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          result,
          attempts: attempt + 1,
          totalTimeMs: Date.now() - startTime,
          errors,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errorMessage);

        if (!this.isRetryableError(errorMessage, config.retryableErrors)) {
          return {
            success: false,
            attempts: attempt + 1,
            totalTimeMs: Date.now() - startTime,
            errors,
          };
        }

        if (attempt < config.maxAttempts - 1) {
          const delay = delayGenerator(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      attempts: config.maxAttempts,
      totalTimeMs: Date.now() - startTime,
      errors,
    };
  }
}