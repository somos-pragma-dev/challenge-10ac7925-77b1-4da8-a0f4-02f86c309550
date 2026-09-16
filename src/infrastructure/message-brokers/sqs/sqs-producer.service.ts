import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class SqsProducerService {
  private readonly logger = new Logger(SqsProducerService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly maxRetries = 3;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.sqsClient = new SQSClient({ region });
    this.queueUrl = this.configService.get<string>('SQS_FIFO_QUEUE_URL') || '';
    
    if (!this.queueUrl) {
      throw new Error('SQS_FIFO_QUEUE_URL environment variable is required');
    }
  }

  async sendMessage(
    payload: Record<string, unknown>,
    options?: {
      deduplicationId?: string;
      messageGroupId?: string;
      delaySeconds?: number;
    },
  ): Promise<SendMessageCommandOutput> {
    const deduplicationId = options?.deduplicationId || randomUUID();
    const messageGroupId = options?.messageGroupId || 'default-group';
    
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(payload),
      MessageDeduplicationId: deduplicationId,
      MessageGroupId: messageGroupId,
      DelaySeconds: options?.delaySeconds || 0,
    });

    try {
      const result = await this.sqsClient.send(command);
      this.logger.log(`Message sent to SQS FIFO: ${result.MessageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message to SQS: ${error}`);
      throw error;
    }
  }

  async sendMessageWithRetry(
    payload: Record<string, unknown>,
    options?: {
      deduplicationId?: string;
      messageGroupId?: string;
      delaySeconds?: number;
    },
    attempt = 1,
  ): Promise<SendMessageCommandOutput> {
    try {
      return await this.sendMessage(payload, options);
    } catch (error) {
      if (attempt >= this.maxRetries) {
        this.logger.error(`Max retries reached for message: ${options?.deduplicationId}`);
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 100 + Math.random() * 100;
      this.logger.warn(`Retry attempt ${attempt} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.sendMessageWithRetry(payload, options, attempt + 1);
    }
  }

  async sendBatch(
    messages: Array<{
      payload: Record<string, unknown>;
      deduplicationId?: string;
      messageGroupId?: string;
    }>,
  ): Promise<void> {
    for (const message of messages) {
      await this.sendMessageWithRetry(message.payload, {
        deduplicationId: message.deduplicationId,
        messageGroupId: message.messageGroupId,
      });
    }
  }

  async publishEvent(
    eventType: string,
    eventData: Record<string, unknown>,
    correlationId: string,
  ): Promise<SendMessageCommandOutput> {
    const message = {
      eventType,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId,
      data: eventData,
    };

    return this.sendMessageWithRetry(message, {
      deduplicationId: correlationId,
      messageGroupId: eventType,
    });
  }

  async close(): Promise<void> {
    await this.sqsClient.destroy();
  }
}