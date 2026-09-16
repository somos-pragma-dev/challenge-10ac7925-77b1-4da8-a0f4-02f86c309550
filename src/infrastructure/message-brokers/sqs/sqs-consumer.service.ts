import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { 
  SQSClient, 
  ReceiveMessageCommand, 
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SqsConsumerConfig {
  maxNumberOfMessages: number;
  waitTimeSeconds: number;
  visibilityTimeout: number;
  maxRetries?: number;
}

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly config: SqsConsumerConfig;
  private isPolling = false;
  private readonly messageHandlers: Map<string, (message: Record<string, unknown>) => Promise<void>>;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.sqsClient = new SQSClient({ region });
    this.queueUrl = this.configService.get<string>('SQS_FIFO_QUEUE_URL') || '';
    
    this.config = {
      maxNumberOfMessages: this.configService.get<number>('SQS_MAX_MESSAGES', 10),
      waitTimeSeconds: this.configService.get<number>('SQS_WAIT_TIME', 20),
      visibilityTimeout: this.configService.get<number>('SQS_VISIBILITY_TIMEOUT', 300),
      maxRetries: this.configService.get<number>('SQS_MAX_RETRIES', 3),
    };

    this.messageHandlers = new Map();
    
    if (!this.queueUrl) {
      throw new Error('SQS_FIFO_QUEUE_URL environment variable is required');
    }
  }

  async onModuleInit(): Promise<void> {
    this.startPolling();
  }

  async onModuleDestroy(): Promise<void> {
    this.isPolling = false;
    await this.sqsClient.destroy();
  }

  registerHandler(eventType: string, handler: (message: Record<string, unknown>) => Promise<void>): void {
    this.messageHandlers.set(eventType, handler);
    this.logger.log(`Registered handler for event type: ${eventType}`);
  }

  private startPolling(): void {
    this.isPolling = true;
    this.poll();
  }

  private async poll(): Promise<void> {
    while (this.isPolling) {
      try {
        await this.processMessages();
      } catch (error) {
        this.logger.error(`Error polling SQS: ${error}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessages(): Promise<void> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: this.config.maxNumberOfMessages,
      WaitTimeSeconds: this.config.waitTimeSeconds,
      VisibilityTimeout: this.config.visibilityTimeout,
      AttributeNames: ['All'],
      MessageAttributeNames: ['All'],
    });

    const response = await this.sqsClient.send(command);
    
    if (!response.Messages || response.Messages.length === 0) {
      return;
    }

    for (const message of response.Messages) {
      await this.handleMessage(message);
    }
  }

  private async handleMessage(message: AWS.SQS.Message): Promise<void> {
    if (!message.Body || !message.MessageId) {
      this.logger.warn('Received invalid message without Body or MessageId');
      return;
    }

    try {
      const parsed = JSON.parse(message.Body);
      const eventType = parsed.eventType || 'unknown';
      const handler = this.messageHandlers.get(eventType);

      if (handler) {
        this.logger.log(`Processing message ${message.MessageId} of type ${eventType}`);
        await handler(parsed);
        await this.deleteMessage(message.ReceiptHandle!);
      } else {
        this.logger.warn(`No handler registered for event type: ${eventType}`);
        await this.deleteMessage(message.ReceiptHandle!);
      }
    } catch (error) {
      this.logger.error(`Error processing message ${message.MessageId}: ${error}`);
      await this.handleFailure(message);
    }
  }

  private async handleFailure(message: AWS.SQS.Message): Promise<void> {
    const receiptHandle = message.ReceiptHandle;
    const attributes = message.Attributes;
    const approximateReceiveCount = parseInt(
      attributes?.ApproximateReceiveCount || '1',
      10
    );

    if (approximateReceiveCount >= (this.config.maxRetries || 3)) {
      this.logger.error(`Message ${message.MessageId} exceeded max retries, moving to DLQ`);
      await this.moveToDeadLetterQueue(message);
      return;
    }

    const visibilityTimeout = 45;
    await this.extendVisibilityTimeout(receiptHandle, visibilityTimeout);
    
    this.logger.warn(
      `Retrying message ${message.MessageId}, attempt ${approximateReceiveCount}`
    );
  }

  private async extendVisibilityTimeout(receiptHandle: string, timeout: number): Promise<void> {
    const command = new ChangeMessageVisibilityCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: timeout,
    });

    await this.sqsClient.send(command);
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqsClient.send(command);
  }

  private async moveToDeadLetterQueue(message: AWS.SQS.Message): Promise<void> {
    const dlqUrl = this.configService.get<string>('SQS_DLQ_URL');
    if (!dlqUrl) {
      this.logger.warn('DLQ not configured, message will be lost');
      await this.deleteMessage(message.ReceiptHandle!);
      return;
    }

    const dlqCommand = new SendMessageCommand({
      QueueUrl: dlqUrl,
      MessageBody: message.Body,
      MessageDeduplicationId: message.MessageId,
      MessageGroupId: 'dlq-group',
    });

    await this.sqsClient.send(dlqCommand);
    await this.deleteMessage(message.ReceiptHandle!);
    this.logger.log(`Message ${message.MessageId} moved to DLQ`);
  }

  async stop(): Promise<void> {
    this.isPolling = false;
  }

  async start(): Promise<void> {
    if (!this.isPolling) {
      this.startPolling();
    }
  }
}