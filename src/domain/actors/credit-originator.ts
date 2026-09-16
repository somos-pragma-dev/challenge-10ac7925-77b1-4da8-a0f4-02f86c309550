import { CreditOriginatedEvent, CreditOriginatedEventData } from '../events/credit-originated.event';
import { CreditDetails, CreditApplicant } from '../events/credit-originated.event';

export enum OriginatorStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum OriginatorType {
  RETAIL = 'RETAIL',
  CORPORATE = 'CORATE',
  MICROFINANCE = 'MICROFINANCE',
  CONSIGNMENT = 'CONSIGNMENT',
}

export interface OriginatorConfiguration {
  readonly maxSingleCreditAmount: number;
  readonly maxMonthlyCreditVolume: number;
  readonly allowedCreditPurposes: ReadonlyArray<string>;
  readonly requiresManualApproval: boolean;
  readonly approvalThreshold: number;
}

export interface OriginatorMetrics {
  readonly totalCreditsOriginated: number;
  readonly totalVolumeProcessed: number;
  readonly averageCreditScore: number;
  readonly approvalRate: number;
  readonly lastActivityAt: Date;
}

export class CreditOriginator {
  readonly originatorId: string;
  readonly name: string;
  readonly type: OriginatorType;
  readonly status: OriginatorStatus;
  readonly configuration: OriginatorConfiguration;
  private metrics: OriginatorMetrics;

  private constructor(
    originatorId: string,
    name: string,
    type: OriginatorType,
    status: OriginatorStatus,
    configuration: OriginatorConfiguration,
    metrics: OriginatorMetrics,
  ) {
    this.originatorId = originatorId;
    this.name = name;
    this.type = type;
    this.status = status;
    this.configuration = configuration;
    this.metrics = metrics;
  }

  static create(
    originatorId: string,
    name: string,
    type: OriginatorType,
    configuration: OriginatorConfiguration,
  ): CreditOriginator {
    const initialMetrics: OriginatorMetrics = {
      totalCreditsOriginated: 0,
      totalVolumeProcessed: 0,
      averageCreditScore: 0,
      approvalRate: 0,
      lastActivityAt: new Date(),
    };

    return new CreditOriginator(
      originatorId,
      name,
      type,
      OriginatorStatus.ACTIVE,
      configuration,
      initialMetrics,
    );
  }

  canOriginateCredit(creditDetails: CreditDetails, applicant: CreditApplicant): boolean {
    if (this.status !== OriginatorStatus.ACTIVE) {
      return false;
    }

    if (creditDetails.amount > this.configuration.maxSingleCreditAmount) {
      return false;
    }

    if (!this.configuration.allowedCreditPurposes.includes(creditDetails.purpose)) {
      return false;
    }

    if (
      this.configuration.requiresManualApproval &&
      creditDetails.amount >= this.configuration.approvalThreshold
    ) {
      return false;
    }

    return true;
  }

  createCreditOriginatedEvent(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    correlationId: string,
    approvedBy: string,
    channel: string,
  ): CreditOriginatedEvent {
    if (!this.canOriginateCredit(creditDetails, applicant)) {
      throw new Error(
        `CreditOriginator ${this.originatorId} cannot originate credit ${creditDetails.creditId}`,
      );
    }

    return CreditOriginatedEvent.create(
      creditDetails,
      applicant,
      correlationId,
      approvedBy,
      channel,
    );
  }

  updateMetrics(eventData: CreditOriginatedEventData): void {
    const newTotalCredits = this.metrics.totalCreditsOriginated + 1;
    const newTotalVolume = this.metrics.totalVolumeProcessed + eventData.credit.amount;
    const newAverageScore =
      (this.metrics.averageCreditScore * this.metrics.totalCreditsOriginated +
        eventData.applicant.creditScore) /
      newTotalCredits;

    this.metrics = {
      totalCreditsOriginated: newTotalCredits,
      totalVolumeProcessed: newTotalVolume,
      averageCreditScore: Math.round(newAverageScore),
      approvalRate: this.calculateApprovalRate(),
      lastActivityAt: new Date(),
    };
  }

  private calculateApprovalRate(): number {
    if (this.metrics.totalCreditsOriginated === 0) {
      return 0;
    }
    return (this.metrics.totalCreditsOriginated / (this.metrics.totalCreditsOriginated + 1)) * 100;
  }

  getMetrics(): Readonly<OriginatorMetrics> {
    return { ...this.metrics };
  }

  suspend(): void {
    if (this.status === OriginatorStatus.ACTIVE) {
      this.status = OriginatorStatus.SUSPENDED;
    }
  }

  activate(): void {
    if (this.status === OriginatorStatus.SUSPENDED || this.status === OriginatorStatus.INACTIVE) {
      this.status = OriginatorStatus.ACTIVE;
    }
  }

  deactivate(): void {
    this.status = OriginatorStatus.INACTIVE;
  }

  isActive(): boolean {
    return this.status === OriginatorStatus.ACTIVE;
  }

  isWithinVolumeLimit(currentMonthVolume: number, proposedAmount: number): boolean {
    return currentMonthVolume + proposedAmount <= this.configuration.maxMonthlyCreditVolume;
  }

  getOriginatorId(): string {
    return this.originatorId;
  }

  getName(): string {
    return this.name;
  }

  getType(): OriginatorType {
    return this.type;
  }

  getStatus(): OriginatorStatus {
    return this.status;
  }

  toPlainObject(): {
    originatorId: string;
    name: string;
    type: OriginatorType;
    status: OriginatorStatus;
    configuration: OriginatorConfiguration;
    metrics: OriginatorMetrics;
  } {
    return {
      originatorId: this.originatorId,
      name: this.name,
      type: this.type,
      status: this.status,
      configuration: this.configuration,
      metrics: { ...this.metrics },
    };
  }
}