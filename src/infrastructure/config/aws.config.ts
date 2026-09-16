import { ConfigService } from '@nestjs/config';
import { SQSClientConfig } from '@aws-sdk/client-sqs';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

export interface AwsSqsConfig {
  readonly region: string;
  readonly endpoint?: string;
  readonly credentials: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
  readonly queueUrls: {
    readonly creditEvents: string;
    readonly fraudAlerts: string;
    readonly originatorNotifications: string;
    readonly compensationEvents: string;
  };
  readonly fifoQueues: boolean;
  readonly messageDeduplicationIdGeneration: 'content' | 'uuid';
}

export interface AwsDynamoDbConfig {
  readonly region: string;
  readonly endpoint?: string;
  readonly credentials: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
  readonly tableName: string;
  readonly billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
  readonly readCapacityUnits?: number;
  readonly writeCapacityUnits?: number;
  readonly streamSpecification?: {
    readonly streamEnabled: boolean;
    readonly streamViewType: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES';
  };
}

@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {}

  getSqsConfig(): AwsSqsConfig {
    const region = this.configService.get<string>('aws.sqs.region', 'us-east-1');
    const endpoint = this.configService.get<string>('aws.sqs.endpoint');
    const accessKeyId = this.configService.get<string>('aws.credentials.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('aws.credentials.secretAccessKey', '');

    const sqsClientConfig: SQSClientConfig = {
      region,
      ...(endpoint && { endpoint }),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    return {
      ...sqsClientConfig,
      queueUrls: {
        creditEvents: this.configService.get<string>('aws.sqs.queues.creditEvents', ''),
        fraudAlerts: this.configService.get<string>('aws.sqs.queues.fraudAlerts', ''),
        originatorNotifications: this.configService.get<string>('aws.sqs.queues.originatorNotifications', ''),
        compensationEvents: this.configService.get<string>('aws.sqs.queues.compensationEvents', ''),
      },
      fifoQueues: this.configService.get<boolean>('aws.sqs.fifoQueues', false),
      messageDeduplicationIdGeneration: this.configService.get<'content' | 'uuid'>(
        'aws.sqs.messageDeduplicationIdGeneration',
        'uuid',
      ),
    };
  }

  getDynamoDbConfig(): AwsDynamoDbConfig {
    const region = this.configService.get<string>('aws.dynamodb.region', 'us-east-1');
    const endpoint = this.configService.get<string>('aws.dynamodb.endpoint');
    const accessKeyId = this.configService.get<string>('aws.credentials.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('aws.credentials.secretAccessKey', '');

    const dynamoDbClientConfig: DynamoDBClientConfig = {
      region,
      ...(endpoint && { endpoint }),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    return {
      ...dynamoDbClientConfig,
      tableName: this.configService.get<string>('aws.dynamodb.tableName', 'event-outbox'),
      billingMode: this.configService.get<'PAY_PER_REQUEST' | 'PROVISIONED'>(
        'aws.dynamodb.billingMode',
        'PAY_PER_REQUEST',
      ),
      readCapacityUnits: this.configService.get<number>('aws.dynamodb.readCapacityUnits'),
      writeCapacityUnits: this.configService.get<number>('aws.dynamodb.writeCapacityUnits'),
      streamSpecification: this.configService.get<AwsDynamoDbConfig['streamSpecification']>(
        'aws.dynamodb.streamSpecification',
      ),
    };
  }

  getAwsRegion(): string {
    return this.configService.get<string>('aws.region', 'us-east-1');
  }

  isLocalStackEnabled(): boolean {
    return !!this.configService.get<string>('aws.sqs.endpoint') ||
           !!this.configService.get<string>('aws.dynamodb.endpoint');
  }

  getRetryConfig() {
    return {
      maxAttempts: this.configService.get<number>('aws.retry.maxAttempts', 3),
      initialDelayMs: this.configService.get<number>('aws.retry.initialDelayMs', 100),
      maxDelayMs: this.configService.get<number>('aws.retry.maxDelayMs', 5000),
    };
  }
}

/*
 * POLÍTICAS IAM REQUERIDAS (comentadas para referencia en documentación):
 *
 * ============================================
 * POLÍTICA: EventProcessorSQSWrite
 * ============================================
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "sqs:SendMessage",
 *         "sqs:SendMessageBatch",
 *         "sqs:GetQueueUrl",
 *         "sqs:GetQueueAttributes"
 *       ],
 *       "Resource": "arn:aws:sqs:*:*:credit-events-*"
 *     },
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "sqs:ReceiveMessage",
 *         "sqs:DeleteMessage",
 *         "sqs:ChangeMessageVisibility",
 *         "sqs:GetQueueAttributes"
 *       ],
 *       "Resource": "arn:aws:sqs:*:*:credit-events-*"
 *     }
 *   ]
 * }
 *
 * ============================================
 * POLÍTICA: EventProcessorDynamoDBFull
 * ============================================
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "dynamodb:PutItem",
 *         "dynamodb:GetItem",
 *         "dynamodb:UpdateItem",
 *         "dynamodb:DeleteItem",
 *         "dynamodb:Query",
 *         "dynamodb:Scan",
 *         "dynamodb:DescribeTable"
 *       ],
 *       "Resource": "arn:aws:dynamodb:*:*:table/event-outbox"
 *     },
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "dynamodb:ListTables"
 *       ],
 *       "Resource": "*"
 *     }
 *   ]
 * }
 *
 * ============================================
 * POLÍTICA: EventProcessorDynamoDBStreams (opcional)
 * ============================================
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "dynamodb:GetRecords",
 *         "dynamodb:GetShardIterator",
 *         "dynamodb:ListShards"
 *       ],
 *       "Resource": "arn:aws:dynamodb:*:*:table/event-outbox/stream/*"
 *     }
 *   ]
 * }
 *
 * NOTA: Para entornos de producción, considera usar roles IAM en lugar de credenciales estáticas.
 *       Usa IAM Roles for Service Accounts (IRSA) en EKS o Instance Profiles en EC2.
 */