import { KafkaConfig, ConsumerConfig, ProducerConfig, AdminClientConfig } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

export interface KafkaBootstrapConfig {
  readonly brokers: string[];
  readonly clientId: string;
  readonly ssl: boolean;
  readonly sasl?: {
    readonly mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    readonly username: string;
    readonly password: string;
  };
}

export interface KafkaConsumerGroupConfig {
  readonly groupId: string;
  readonly sessionTimeoutMs: number;
  readonly heartbeatIntervalMs: number;
  readonly rebalanceTimeoutMs: number;
  readonly maxWaitTimeInMs: number;
  readonly minBytes: number;
  readonly maxBytes: number;
  readonly maxBytesPerPartition: number;
}

export interface KafkaExactlyOnceConfig {
  readonly enableIdempotence: boolean;
  readonly transactionTimeoutMs: number;
  readonly isolationLevel: 'read_uncommitted' | 'read_committed';
  readonly maxInFlightRequests: number;
  readonly retryTimeoutMs: number;
}

export interface KafkaTopicConfig {
  readonly topics: Array<{
    readonly name: string;
    readonly numPartitions: number;
    readonly replicationFactor: number;
    readonly retentionMs: number;
    readonly retentionBytes: number;
    readonly segmentMs: number;
    readonly segmentBytes: number;
    readonly maxMessageBytes: number;
    readonly compressionType: 'gzip' | 'snappy' | 'lz4' | 'zstd';
  }>;
}

export class KafkaConfigurationService {
  private readonly configService: ConfigService;
  private readonly environment: string;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.environment = this.configService.get<string>('NODE_ENV', 'development');
  }

  getBootstrapConfig(): KafkaBootstrapConfig {
    const brokersString = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092');
    const brokers = brokersString.split(',').map(b => b.trim());
    const ssl = this.environment !== 'development';

    const saslUsername = this.configService.get<string>('KAFKA_SASL_USERNAME');
    const saslPassword = this.configService.get<string>('KAFKA_SASL_PASSWORD');

    let sasl: KafkaBootstrapConfig['sasl'] | undefined;
    if (saslUsername && saslPassword) {
      sasl = {
        mechanism: 'scram-sha-512',
        username: saslUsername,
        password: saslPassword,
      };
    }

    return {
      brokers,
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'credit-processing-service'),
      ssl,
      sasl,
    };
  }

  getProducerConfig(): ProducerConfig {
    const bootstrapConfig = this.getBootstrapConfig();
    const exactlyOnceConfig = this.getExactlyOnceConfig();

    return {
      clientId: bootstrapConfig.clientId,
      brokers: bootstrapConfig.brokers,
      ssl: bootstrapConfig.ssl ? { rejectUnauthorized: false } : false,
      sasl: bootstrapConfig.sasl,
      allowAutoCreateTopics: false,
      enableIdempotence: exactlyOnceConfig.enableIdempotence,
      maxInFlightRequests: exactlyOnceConfig.maxInFlightRequests,
      transactionTimeoutMs: exactlyOnceConfig.transactionTimeoutMs,
      retry: {
        initialRetryTime: 100,
        retries: 8,
        factor: 2,
        maxRetryTime: 30000,
      },
    };
  }

  getConsumerConfig(groupSuffix: string = 'default'): KafkaConsumerGroupConfig {
    const baseGroupId = this.configService.get<string>('KAFKA_CONSUMER_GROUP', 'credit-processing-group');

    return {
      groupId: `${baseGroupId}-${groupSuffix}`,
      sessionTimeoutMs: 45000,
      heartbeatIntervalMs: 3000,
      rebalanceTimeoutMs: 60000,
      maxWaitTimeInMs: 5000,
      minBytes: 1,
      maxBytes: 10485760,
      maxBytesPerPartition: 1048576,
    };
  }

  getExactlyOnceConfig(): KafkaExactlyOnceConfig {
    const enableIdempotence = this.configService.get<boolean>('KAFKA_ENABLE_IDEMPOTENCE', true);

    return {
      enableIdempotence,
      transactionTimeoutMs: this.configService.get<number>('KAFKA_TRANSACTION_TIMEOUT_MS', 60000),
      isolationLevel: this.configService.get<'read_uncommitted' | 'read_committed'>(
        'KAFKA_ISOLATION_LEVEL',
        'read_committed'
      ),
      maxInFlightRequests: enableIdempotence ? 5 : 100,
      retryTimeoutMs: this.configService.get<number>('KAFKA_RETRY_TIMEOUT_MS', 30000),
    };
  }

  getTopicConfig(): KafkaTopicConfig {
    return {
      topics: [
        {
          name: this.configService.get<string>('KAFKA_TOPIC_CREDIT_ORIGINATED', 'credit.originated'),
          numPartitions: this.configService.get<number>('KAFKA_TOPIC_CREDIT_PARTITIONS', 12),
          replicationFactor: this.configService.get<number>('KAFKA_TOPIC_REPLICATION_FACTOR', 3),
          retentionMs: 604800000,
          retentionBytes: -1,
          segmentMs: 604800000,
          segmentBytes: 1073741824,
          maxMessageBytes: 1048588,
          compressionType: 'zstd',
        },
        {
          name: this.configService.get<string>('KAFKA_TOPIC_FRAUD_CHECKED', 'fraud.checked'),
          numPartitions: this.configService.get<number>('KAFKA_TOPIC_FRAUD_PARTITIONS', 12),
          replicationFactor: this.configService.get<number>('KAFKA_TOPIC_REPLICATION_FACTOR', 3),
          retentionMs: 259200000,
          retentionBytes: -1,
          segmentMs: 604800000,
          segmentBytes: 1073741824,
          maxMessageBytes: 1048588,
          compressionType: 'zstd',
        },
        {
          name: this.configService.get<string>('KAFKA_TOPIC_SAGA_EVENTS', 'saga.events'),
          numPartitions: this.configService.get<number>('KAFKA_TOPIC_SAGA_PARTITIONS', 6),
          replicationFactor: this.configService.get<number>('KAFKA_TOPIC_REPLICATION_FACTOR', 3),
          retentionMs: 86400000,
          retentionBytes: -1,
          segmentMs: 86400000,
          segmentBytes: 536870912,
          maxMessageBytes: 1048588,
          compressionType: 'zstd',
        },
      ],
    };
  }

  createKafkaConfig(): KafkaConfig {
    const bootstrapConfig = this.getBootstrapConfig();
    const exactlyOnceConfig = this.getExactlyOnceConfig();

    return {
      clientId: bootstrapConfig.clientId,
      brokers: bootstrapConfig.brokers,
      ssl: bootstrapConfig.ssl ? { rejectUnauthorized: false } : false,
      sasl: bootstrapConfig.sasl,
      connectionTimeout: 10000,
      authenticationTimeout: 10000,
      reauthenticationThreshold: 10000,
      enforceSslPrefixMatch: true,
    };
  }

  createAdminConfig(): AdminClientConfig {
    const bootstrapConfig = this.getBootstrapConfig();

    return {
      clientId: `${bootstrapConfig.clientId}-admin`,
      brokers: bootstrapConfig.brokers,
      ssl: bootstrapConfig.ssl ? { rejectUnauthorized: false } : false,
      sasl: bootstrapConfig.sasl,
    };
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }

  getSecurityConfig(): { sslEndpointIdentificationAlgorithm: 'https' | 'none'; sslCertificateLocation?: string } {
    if (this.isProduction()) {
      return { sslEndpointIdentificationAlgorithm: 'https' };
    }
    return { sslEndpointIdentificationAlgorithm: 'none' };
  }
}

export const KAFKA_CONFIG_TOKEN = 'KAFKA_CONFIG';

export const createKafkaConfigurationProvider = {
  provide: KAFKA_CONFIG_TOKEN,
  useFactory: (configService: ConfigService): KafkaConfigurationService => {
    return new KafkaConfigurationService(configService);
  },
  inject: [ConfigService],
};