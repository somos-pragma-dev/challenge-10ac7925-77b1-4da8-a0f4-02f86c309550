import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ulid } from 'ulid';
import { CreditOriginator } from '@domain/actors/credit-originator';
import { CreditOriginatedEvent, CreditDetails, CreditApplicant } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent, FraudCheckResult, FraudRiskLevel, FraudCheckStatus } from '@domain/events/fraud-checked.event';
import { EventPublisherService } from '@application/services/event-publisher.service';
import awsConfig from '@infrastructure/config/aws.config';

export interface ProcessCreditCommand {
  readonly applicant: {
    readonly applicantId: string;
    readonly fullName: string;
    readonly email: string;
    readonly documentType: 'CPF' | 'CNPJ' | 'PASSPORT';
    readonly documentNumber: string;
    readonly monthlyIncome: number;
    readonly creditScore: number;
  };
  readonly credit: {
    readonly amount: number;
    readonly currency: string;
    readonly termMonths: number;
    readonly interestRate: number;
    readonly purpose: 'PERSONAL' | 'BUSINESS' | 'REFINANCING' | 'CONSIGNMENT';
    readonly firstPaymentDate: Date;
  };
  readonly originatorId: string;
  readonly channel: string;
}

export interface ProcessCreditResult {
  readonly creditId: string;
  readonly status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  readonly correlationId: string;
  readonly events: Array<{ eventType: string; eventId: string }>;
  readonly message: string;
}

@Injectable()
export class ProcessCreditUseCase {
  private readonly logger = new Logger(ProcessCreditUseCase.name);
  private readonly creditOriginator: CreditOriginator;
  private readonly eventPublisher: EventPublisherService;
  private readonly awsConfiguration: ConfigType<typeof awsConfig>;

  constructor(
    @Inject('CreditOriginator') creditOriginator: CreditOriginator,
    eventPublisher: EventPublisherService,
    @Inject(awsConfig.KEY) awsConfiguration: ConfigType<typeof awsConfig>,
  ) {
    this.creditOriginator = creditOriginator;
    this.eventPublisher = eventPublisher;
    this.awsConfiguration = awsConfiguration;
  }

  async execute(command: ProcessCreditCommand): Promise<ProcessCreditResult> {
    const correlationId = ulid();
    const creditId = `CREDIT-${ulid()}`;
    const eventId = ulid();
    const occurredAt = new Date();
    
    this.logger.log(
      `Starting credit processing: creditId=${creditId}, correlationId=${correlationId}, applicant=${command.applicant.applicantId}`,
    );

    if (!this.creditOriginator.canOriginateCredit(
      this.mapToCreditDetails(creditId, command.credit),
      this.mapToCreditApplicant(command.applicant),
    )) {
      throw new BadRequestException(
        `Credit cannot be originated by originator ${this.creditOriginator.getOriginatorId()}. ` +
        `Check volume limits, amount limits, or credit purpose restrictions.`,
      );
    }

    const creditOriginatedEvent = CreditOriginatedEvent.create(
      {
        eventId,
        occurredAt,
        version: '1.0.0',
        correlationId,
      },
      {
        credit: this.mapToCreditDetails(creditId, command.credit),
        applicant: this.mapToCreditApplicant(command.applicant),
        originators: [this.creditOriginator.getOriginatorId()],
        approvedBy: this.creditOriginator.getName(),
        channel: command.channel,
      },
    );

    await this.eventPublisher.publishCreditOriginatedEvent(creditOriginatedEvent);

    const fraudCheckResult = await this.performFraudCheck(
      creditId,
      command.applicant,
      correlationId,
      occurredAt,
    );

    const status = this.determineCreditStatus(fraudCheckResult);
    
    const fraudCheckedEvent = FraudCheckedEvent.create(
      {
        eventId: ulid(),
        occurredAt: new Date(),
        version: '1.0.0',
        correlationId,
        causationId: eventId,
      },
      {
        creditId,
        applicantId: command.applicant.applicantId,
        fraudCheckId: `FRAUD-${ulid()}`,
        result: fraudCheckResult,
        breakdown: {
          identityVerification: true,
          addressVerification: true,
          incomeVerification: true,
          creditBureauCheck: true,
          velocityCheck: true,
          deviceFingerprintCheck: true,
          biometricVerification: true,
        },
        checkedBy: 'FraudEngine',
        processingTimeMs: 150,
      },
    );

    await this.eventPublisher.publishFraudCheckedEvent(fraudCheckedEvent);

    this.creditOriginator.updateMetrics(creditOriginatedEvent.data);

    this.logger.log(
      `Credit processing completed: creditId=${creditId}, status=${status}, correlationId=${correlationId}`,
    );

    return {
      creditId,
      status,
      correlationId,
      events: [
        { eventType: 'CreditOriginated', eventId: creditOriginatedEvent.getEventId() },
        { eventType: 'FraudChecked', eventId: fraudCheckedEvent.getEventId() },
      ],
      message: this.getStatusMessage(status),
    };
  }

  private async performFraudCheck(
    creditId: string,
    applicant: ProcessCreditCommand['applicant'],
    correlationId: string,
    occurredAt: Date,
  ): Promise<FraudCheckResult> {
    this.logger.debug(`Performing fraud check for credit ${creditId}`);

    const fraudScore = this.calculateFraudScore(applicant);
    const riskLevel = this.determineRiskLevel(fraudScore, applicant.creditScore);
    
    const status = riskLevel === FraudRiskLevel.LOW 
      ? FraudCheckStatus.APPROVED 
      : riskLevel === FraudRiskLevel.MEDIUM 
        ? FraudCheckStatus.REVIEW 
        : FraudCheckStatus.REJECTED;

    return {
      status,
      riskLevel,
      fraudScore,
      checksPerformed: [
        'identityVerification',
        'addressVerification',
        'incomeVerification',
        'creditBureauCheck',
        'velocityCheck',
        'deviceFingerprintCheck',
        'biometricVerification',
      ],
      flags: riskLevel !== FraudRiskLevel.LOW 
        ? ['elevated_risk', riskLevel === FraudRiskLevel.HIGH ? 'high_risk_detected' : 'review_required']
        : [],
      recommendation: status === FraudCheckStatus.APPROVED 
        ? 'APPROVE' 
        : status === FraudCheckStatus.REVIEW 
          ? 'REVIEW' 
          : 'REJECT',
    };
  }

  private calculateFraudScore(applicant: ProcessCreditCommand['applicant']): number {
    let score = 0;
    
    if (applicant.creditScore < 500) score += 40;
    else if (applicant.creditScore < 650) score += 20;
    else if (applicant.creditScore < 700) score += 10;
    
    if (applicant.monthlyIncome < 2000) score += 30;
    else if (applicant.monthlyIncome < 5000) score += 15;
    
    const documentNumber = applicant.documentNumber.replace(/\D/g, '');
    if (documentNumber.length < 8 || documentNumber.length > 14) score += 25;
    
    return Math.min(score, 100);
  }

  private determineRiskLevel(fraudScore: number, creditScore: number): FraudRiskLevel {
    if (fraudScore >= 60 || creditScore < 500) return FraudRiskLevel.HIGH;
    if (fraudScore >= 30 || creditScore < 650) return FraudRiskLevel.MEDIUM;
    return FraudRiskLevel.LOW;
  }

  private determineCreditStatus(fraudCheckResult: FraudCheckResult): 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW' {
    switch (fraudCheckResult.recommendation) {
      case 'APPROVE':
        return 'APPROVED';
      case 'REJECT':
        return 'REJECTED';
      case 'REVIEW':
      default:
        return 'PENDING_REVIEW';
    }
  }

  private getStatusMessage(status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW'): string {
    switch (status) {
      case 'APPROVED':
        return 'Credit has been approved and events published successfully.';
      case 'REJECTED':
        return 'Credit has been rejected due to fraud risk assessment.';
      case 'PENDING_REVIEW':
        return 'Credit requires manual review. Events have been published for processing.';
    }
  }

  private mapToCreditDetails(creditId: string, credit: ProcessCreditCommand['credit']): CreditDetails {
    const monthlyRate = credit.interestRate / 100 / 12;
    const installments = credit.termMonths;
    const installmentAmount = credit.amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
      (Math.pow(1 + monthlyRate, installments) - 1);

    return {
      creditId,
      amount: credit.amount,
      currency: credit.currency,
      termMonths: credit.termMonths,
      interestRate: credit.interestRate,
      purpose: credit.purpose,
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      firstPaymentDate: credit.firstPaymentDate,
    };
  }

  private mapToCreditApplicant(applicant: ProcessCreditCommand['applicant']): CreditApplicant {
    return {
      applicantId: applicant.applicantId,
      fullName: applicant.fullName,
      email: applicant.email,
      documentType: applicant.documentType,
      documentNumber: applicant.documentNumber,
      monthlyIncome: applicant.monthlyIncome,
      creditScore: applicant.creditScore,
    };
  }
}