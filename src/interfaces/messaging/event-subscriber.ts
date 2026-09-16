import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MessageBroker, MessageBrokerMessage } from '@infrastructure/message-brokers/message-broker.interface';
import { SagaCoordinatorService } from '@infrastructure/saga/saga-coordinator.service';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';

const CREDIT_ORIGINATED_TOPIC = 'credit.originated';
const FRAUD_CHECKED_TOPIC = 'fraud.checked';

@Injectable()
export class EventSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventSubscriber.name);
  private isConsuming = false;

  constructor(
    private readonly messageBroker: MessageBroker,
    private readonly sagaCoordinator: SagaCoordinatorService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing event subscriber...');
    await this.subscribeToTopics();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down event subscriber...');
    this.isConsuming = false;
  }

  private async subscribeToTopics(): Promise<void> {
    try {
      await this.messageBroker.subscribe(
        CREDIT_ORIGINATED_TOPIC,
        this.handleCreditOriginatedEvent.bind(this)
      );

      await this.messageBroker.subscribe(
        FRAUD_CHECKED_TOPIC,
        this.handleFraudCheckedEvent.bind(this)
      );

      this.isConsuming = true;
      this.logger.log(`Subscribed to topics: ${CREDIT_ORIGINATED_TOPIC}, ${FRAUD_CHECKED_TOPIC}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleCreditOriginatedEvent(message: MessageBrokerMessage): Promise<void> {
    const { eventId, correlationId, payload } = message;

    this.logger.log(
      `Processing CreditOriginatedEvent: eventId=${eventId}, correlationId=${correlationId}`
    );

    try {
      const event = CreditOriginatedEvent.fromPayload(payload);

      const sagaExecutionId = await this.sagaCoordinator.startSaga({
        sagaType: 'credit-processing',
        correlationId: event.getCorrelationId(),
        payload: {
          creditId: event.getCreditId(),
          applicantId: event.getApplicantId(),
          amount: event.getAmount(),
          purpose: event.getPurpose(),
          eventId: event.getEventId(),
        },
        compensationActions: [
          {
            stepName: 'fraud-check',
            compensate: async () => {
              this.logger.warn(`Compensating fraud check for credit: ${event.getCreditId()}`);
            },
          },
          {
            stepName: 'credit-origination',
            compensate: async () => {
              this.logger.warn(`Compensating credit origination for credit: ${event.getCreditId()}`);
            },
          },
        ],
      });

      this.logger.log(
        `Saga initiated for credit processing: sagaExecutionId=${sagaExecutionId}, creditId=${event.getCreditId()}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to process CreditOriginatedEvent: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async handleFraudCheckedEvent(message: MessageBrokerMessage): Promise<void> {
    const { eventId, correlationId, payload } = message;

    this.logger.log(
      `Processing FraudCheckedEvent: eventId=${eventId}, correlationId=${correlationId}`
    );

    try {
      const event = FraudCheckedEvent.fromPayload(payload);

      if (event.isApproved()) {
        this.logger.log(
          `Fraud check approved for credit: ${event.getCreditId()}, proceeding with saga`
        );
        await this.sagaCoordinator.processStep({
          stepName: 'fraud-check',
          correlationId: event.getCorrelationId(),
          result: 'SUCCESS',
          data: {
            fraudScore: event.getFraudScore(),
            riskLevel: event.getRiskLevel(),
          },
        });
      } else if (event.isRejected()) {
        this.logger.warn(
          `Fraud check rejected for credit: ${event.getCreditId()}, initiating compensation`
        );
        await this.sagaCoordinator.compensate({
          correlationId: event.getCorrelationId(),
          stepName: 'fraud-check',
          reason: `Fraud check failed with recommendation: ${event.getRecommendation()}`,
        });
      } else if (event.requiresManualReview()) {
        this.logger.warn(
          `Fraud check requires manual review for credit: ${event.getCreditId()}`
        );
        await this.sagaCoordinator.processStep({
          stepName: 'fraud-check',
          correlationId: event.getCorrelationId(),
          result: 'MANUAL_REVIEW',
          data: {
            fraudScore: event.getFraudScore(),
            riskLevel: event.getRiskLevel(),
            checksPerformed: event.getChecksPerformed(),
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process FraudCheckedEvent: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  getSubscriptionStatus(): { isConsuming: boolean; topics: string[] } {
    return {
      isConsuming: this.isConsuming,
      topics: [CREDIT_ORIGINATED_TOPIC, FRAUD_CHECKED_TOPIC],
    };
  }
}