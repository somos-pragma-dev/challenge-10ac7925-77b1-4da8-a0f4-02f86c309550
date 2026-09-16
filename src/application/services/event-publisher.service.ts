import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MessageBroker } from '@infrastructure/message-brokers/message-broker.interface';
import { OutboxRepository } from '@infrastructure/outbox/outbox.repository';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';
import awsConfig from '@infrastructure/config/aws.config';
import { CreditOriginatedEventData } from '@domain/events/credit-originated.event';
import { FraudCheckedEventData } from '@domain/events/fraud-checked.event';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private readonly messageBroker: MessageBroker;
  private readonly outboxRepository: OutboxRepository;
  private readonly awsConfiguration: ConfigType<typeof awsConfig>;

  constructor(
    @Inject('MessageBroker') messageBroker: MessageBroker,
    @Inject('OutboxRepository') outboxRepository: OutboxRepository,
    @Inject(awsConfig.KEY) awsConfiguration: ConfigType<typeof awsConfig>,
  ) {
    this.messageBroker = messageBroker;
    this.outboxRepository = outboxRepository;
    this.awsConfiguration = awsConfiguration;
  }

  async publishCreditOriginatedEvent(
    event: CreditOriginatedEvent,
  ): Promise<void> {
    const eventData = event.toPlainObject();
    const topic = this.awsConfiguration.kafka?.topics?.creditOriginated 
      || 'credit.originated';
    
    try {
      await this.outboxRepository.save({
        id: event.getEventId(),
        aggregateId: event.getCreditId(),
        aggregateType: 'Credit',
        eventType: 'CreditOriginated',
        payload: eventData,
        correlationId: event.getCorrelationId(),
        causationId: event.getOccurredAt().toISOString(),
        timestamp: event.getOccurredAt(),
        metadata: {
          purpose: event.getPurpose(),
          amount: event.getAmount(),
          isHighValue: event.isHighValue(),
          isHighRiskApplicant: event.isHighRiskApplicant(),
        },
      });

      await this.messageBroker.publish(topic, eventData, {
        correlationId: event.getCorrelationId(),
        messageId: event.getEventId(),
        timestamp: event.getOccurredAt().toISOString(),
      });

      this.logger.log(
        `Published CreditOriginatedEvent for credit ${event.getCreditId()} ` +
        `with correlation ${event.getCorrelationId()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish CreditOriginatedEvent: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async publishFraudCheckedEvent(
    event: FraudCheckedEvent,
  ): Promise<void> {
    const eventData = event.toPlainObject();
    const topic = this.awsConfiguration.kafka?.topics?.fraudChecked 
      || 'fraud.checked';
    
    try {
      await this.outboxRepository.save({
        id: event.getEventId(),
        aggregateId: event.getCreditId(),
        aggregateType: 'Credit',
        eventType: 'FraudChecked',
        payload: eventData,
        correlationId: event.getCorrelationId(),
        causationId: event.getOccurredAt().toISOString(),
        timestamp: event.getOccurredAt(),
        metadata: {
          riskLevel: event.getRiskLevel(),
          status: event.getStatus(),
          fraudScore: event.getFraudScore(),
          recommendation: event.getRecommendation(),
        },
      });

      await this.messageBroker.publish(topic, eventData, {
        correlationId: event.getCorrelationId(),
        messageId: event.getEventId(),
        timestamp: event.getOccurredAt().toISOString(),
      });

      this.logger.log(
        `Published FraudCheckedEvent for credit ${event.getCreditId()} ` +
        `with correlation ${event.getCorrelationId()}, recommendation: ${event.getRecommendation()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish FraudCheckedEvent: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async publishBatchEvents(
    events: Array<CreditOriginatedEvent | FraudCheckedEvent>,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const event of events) {
      try {
        if (event instanceof CreditOriginatedEvent) {
          await this.publishCreditOriginatedEvent(event);
        } else if (event instanceof FraudCheckedEvent) {
          await this.publishFraudCheckedEvent(event);
        }
        success++;
      } catch (error) {
        failed++;
        this.logger.warn(
          `Failed to publish event in batch: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.logger.log(
      `Batch publish completed: ${success} succeeded, ${failed} failed`,
    );

    return { success, failed };
  }

  async retryFailedEvents(maxRetries: number = 3): Promise<number> {
    try {
      const failedEvents = await this.outboxRepository.findPending();
      let retriedCount = 0;

      for (const outboxMessage of failedEvents) {
        if (outboxMessage.retryCount >= maxRetries) {
          this.logger.warn(
            `Outbox message ${outboxMessage.id} exceeded max retries, marking as dead-letter`,
          );
          await this.outboxRepository.markAsDeadLetter(outboxMessage.id);
          continue;
        }

        try {
          const topic = outboxMessage.eventType === 'CreditOriginated'
            ? (this.awsConfiguration.kafka?.topics?.creditOriginated || 'credit.originated')
            : (this.awsConfiguration.kafka?.topics?.fraudChecked || 'fraud.checked');

          await this.messageBroker.publish(
            topic,
            outboxMessage.payload,
            {
              correlationId: outboxMessage.correlationId,
              messageId: outboxMessage.id,
              timestamp: outboxMessage.timestamp.toISOString(),
            },
          );

          await this.outboxRepository.markAsProcessed(outboxMessage.id);
          retriedCount++;
        } catch (error) {
          await this.outboxRepository.incrementRetryCount(outboxMessage.id);
          this.logger.warn(
            `Retry failed for outbox message ${outboxMessage.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      this.logger.log(`Retry process completed: ${retriedCount} events retried`);
      return retriedCount;
    } catch (error) {
      this.logger.error(
        `Error during retry process: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}