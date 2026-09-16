import { Injectable, Logger } from '@nestjs/common';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent } from '@domain/events/fraud-checked.event';
import { OutboxRepository } from '@infrastructure/outbox/outbox.repository';
import { SQSProducerService } from '@infrastructure/message-brokers/sqs/sqs-producer.service';

export enum CompensationStep {
  REVERT_CREDIT_ORIGINATION = 'REVERT_CREDIT_ORIGINATION',
  MARK_FRAUD_ALERT = 'MARK_FRAUD_ALERT',
  NOTIFY_ORIGINATOR = 'NOTIFY_ORIGINATOR',
  RELEASE_RESERVED_FUNDS = 'RELEASE_RESERVED_FUNDS',
}

export interface CompensationContext {
  readonly sagaId: string;
  readonly correlationId: string;
  readonly stepThatFailed: CompensationStep;
  readonly originalEvent: CreditOriginatedEvent | FraudCheckedEvent;
  readonly failureReason: string;
  readonly timestamp: Date;
}

export interface CompensationResult {
  readonly success: boolean;
  readonly compensationId: string;
  readonly stepsExecuted: CompensationStep[];
  readonly errors: string[];
}

interface CompensationStepQueue {
  push(step: CompensationStep): void;
  join(): Promise<void>;
}

@Injectable()
export class CompensationHandler {
  private readonly logger = new Logger(CompensationHandler.name);
  private readonly compensationRecords: Map<string, {
    sagaId: string;
    correlationId: string;
    errors: string[];
    timestamp: Date;
  }>;
  private readonly stepQueue: CompensationStepQueue[];

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly sqsProducer: SQSProducerService,
  ) {
    this.compensationRecords = new Map();
    this.stepQueue = [];
  }

  async recordCompensation(
    sagaId: string,
    correlationId: string,
    errorMessage: string,
  ): Promise<string> {
    const compensationId = `COMP-${sagaId}-${Date.now()}`;
    
    this.compensationRecords.set(compensationId, {
      sagaId,
      correlationId,
      errors: [errorMessage],
      timestamp: new Date(),
    });

    this.logger.log(`Compensation recorded for saga ${sagaId}: ${compensationId}`);
    return compensationId;
  }

  async recordCompensationFailure(
    sagaId: string,
    stepId: string,
    errorMessage: string,
  ): Promise<void> {
    this.logger.error(
      `Compensation failure for saga ${sagaId}, step ${stepId}: ${errorMessage}`
    );

    const failureRecord = {
      sagaId,
      stepId,
      error: errorMessage,
      timestamp: new Date(),
    };

    await this.outboxRepository.save({
      id: `COMP-FAILURE-${sagaId}-${stepId}-${Date.now()}`,
      aggregateType: 'SagaCompensationFailure',
      aggregateId: sagaId,
      eventType: 'CompensationFailureRecorded',
      payload: failureRecord as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: sagaId,
      version: 1,
    });
  }

  async handleCompensation(context: CompensationContext): Promise<CompensationResult> {
    const stepsExecuted: CompensationStep[] = [];
    const errors: string[] = [];

    this.logger.warn(
      `Initiating compensation for saga ${context.sagaId} after failure at step ${context.stepThatFailed}`,
    );

    try {
      if (context.originalEvent instanceof CreditOriginatedEvent) {
        const creditId = context.originalEvent.getCreditId();
        
        await this.revertCreditOrigination(creditId, context);
        stepsExecuted.push(CompensationStep.REVERT_CREDIT_ORIGINATION);

        await this.notifyOriginatorOfFailure(creditId, context);
        stepsExecuted.push(CompensationStep.NOTIFY_ORIGINATOR);

        await this.releaseReservedFunds(creditId, context);
        stepsExecuted.push(CompensationStep.RELEASE_RESERVED_FUNDS);
      }

      if (context.originalEvent instanceof FraudCheckedEvent) {
        const fraudCheckId = context.originalEvent.getEventId();
        
        await this.markFraudAlert(fraudCheckId, context);
        stepsExecuted.push(CompensationStep.MARK_FRAUD_ALERT);
      }

      const compensationId = `COMP-${context.sagaId}-${Date.now()}`;
      
      await this.persistCompensationRecord(compensationId, context, stepsExecuted);

      this.logger.log(
        `Compensation completed successfully for saga ${context.sagaId}. Steps executed: ${stepsExecuted.join(', ')}`,
      );

      return {
        success: true,
        compensationId,
        stepsExecuted,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      this.logger.error(
        `Compensation failed for saga ${context.sagaId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        compensationId: `COMP-${context.sagaId}-FAILED`,
        stepsExecuted,
        errors,
      };
    }
  }

  private async revertCreditOrigination(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Reverting credit origination for credit ${creditId}`);
    
    const compensationPayload = {
      action: 'REVERT_CREDIT',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      reason: context.failureReason,
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-${creditId}-${Date.now()}`,
      aggregateType: 'Credit',
      aggregateId: creditId,
      eventType: 'CreditReversedEvent',
      payload: compensationPayload as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });

    this.logger.debug(`Credit reversal queued for credit ${creditId}`);
  }

  private async markFraudAlert(
    fraudCheckId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Marking fraud alert for check ${fraudCheckId}`);
    
    const fraudAlertPayload = {
      action: 'MARK_FRAUD',
      fraudCheckId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      reason: context.failureReason,
      severity: 'HIGH',
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-FRAUD-${fraudCheckId}-${Date.now()}`,
      aggregateType: 'FraudCheck',
      aggregateId: fraudCheckId,
      eventType: 'FraudAlertMarkedEvent',
      payload: fraudAlertPayload as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });

    await this.sqsProducer.sendMessage(
      'fraud-alerts-queue',
      fraudAlertPayload,
      { correlationId: context.correlationId },
    );
  }

  private async notifyOriginatorOfFailure(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Notifying originator of failure for credit ${creditId}`);
    
    const notificationPayload = {
      action: 'NOTIFY_FAILURE',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      message: `Credit origination failed: ${context.failureReason}`,
      timestamp: context.timestamp.toISOString(),
    };

    await this.sqsProducer.sendMessage(
      'originator-notifications-queue',
      notificationPayload,
      { correlationId: context.correlationId },
    );
  }

  private async releaseReservedFunds(
    creditId: string,
    context: CompensationContext,
  ): Promise<void> {
    this.logger.log(`Releasing reserved funds for credit ${creditId}`);
    
    const releasePayload = {
      action: 'RELEASE_FUNDS',
      creditId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      timestamp: context.timestamp.toISOString(),
    };

    await this.outboxRepository.save({
      id: `OUTBOX-FUNDS-${creditId}-${Date.now()}`,
      aggregateType: 'Credit',
      aggregateId: creditId,
      eventType: 'FundsReleasedEvent',
      payload: releasePayload as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });
  }

  private async persistCompensationRecord(
    compensationId: string,
    context: CompensationContext,
    stepsExecuted: CompensationStep[],
  ): Promise<void> {
    const compensationRecord = {
      id: compensationId,
      sagaId: context.sagaId,
      correlationId: context.correlationId,
      failedStep: context.stepThatFailed,
      failureReason: context.failureReason,
      executedSteps: stepsExecuted,
      executedAt: new Date(),
      status: 'COMPLETED',
    };

    await this.outboxRepository.save({
      id: compensationId,
      aggregateType: 'SagaCompensation',
      aggregateId: context.sagaId,
      eventType: 'SagaCompensationCompleted',
      payload: compensationRecord as any,
      status: 'pending' as any,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      correlationId: context.correlationId,
      version: 1,
    });
  }

  async canCompensate(step: CompensationStep): Promise<boolean> {
    const compensableSteps = [
      CompensationStep.REVERT_CREDIT_ORIGINATION,
      CompensationStep.MARK_FRAUD_ALERT,
      CompensationStep.NOTIFY_ORIGINATOR,
      CompensationStep.RELEASE_RESERVED_FUNDS,
    ];
    
    return compensableSteps.includes(step);
  }
}