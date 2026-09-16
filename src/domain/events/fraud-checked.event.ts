export enum FraudRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FraudCheckStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
}

export interface FraudCheckResult {
  readonly status: FraudCheckStatus;
  readonly riskLevel: FraudRiskLevel;
  readonly fraudScore: number;
  readonly checksPerformed: ReadonlyArray<string>;
  readonly flags: ReadonlyArray<string>;
  readonly recommendation: 'APPROVE' | 'REVIEW' | 'REJECT';
}

export interface FraudCheckBreakdown {
  readonly identityVerification: boolean;
  readonly addressVerification: boolean;
  readonly incomeVerification: boolean;
  readonly creditBureauCheck: boolean;
  readonly velocityCheck: boolean;
  readonly deviceFingerprintCheck: boolean;
  readonly biometricVerification: boolean;
}

export interface FraudCheckedEventMetadata {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly version: string;
  readonly correlationId: string;
  readonly causationId: string;
}

export interface FraudCheckedEventData {
  readonly creditId: string;
  readonly applicantId: string;
  readonly fraudCheckId: string;
  readonly result: FraudCheckResult;
  readonly breakdown: FraudCheckBreakdown;
  readonly checkedBy: string;
  readonly processingTimeMs: number;
}

export class FraudCheckedEvent {
  readonly eventType = 'FraudChecked';
  readonly metadata: FraudCheckedEventMetadata;
  readonly data: FraudCheckedEventData;

  private constructor(metadata: FraudCheckedEventMetadata, data: FraudCheckedEventData) {
    this.metadata = metadata;
    this.data = data;
  }

  static create(
    creditId: string,
    applicantId: string,
    fraudCheckId: string,
    result: FraudCheckResult,
    breakdown: FraudCheckBreakdown,
    checkedBy: string,
    processingTimeMs: number,
    correlationId: string,
  ): FraudCheckedEvent {
    const metadata: FraudCheckedEventMetadata = {
      eventId: `evt-fraud-${fraudCheckId}-${Date.now()}`,
      occurredAt: new Date(),
      version: '1.0.0',
      correlationId,
      causationId: creditId,
    };

    const data: FraudCheckedEventData = {
      creditId,
      applicantId,
      fraudCheckId,
      result,
      breakdown,
      checkedBy,
      processingTimeMs,
    };

    return new FraudCheckedEvent(metadata, data);
  }

  static fromPayload(payload: Record<string, unknown>): FraudCheckedEvent {
    const metadata: FraudCheckedEventMetadata = {
      eventId: payload.eventId as string,
      occurredAt: new Date(payload.occurredAt as string),
      version: payload.version as string,
      correlationId: payload.correlationId as string,
      causationId: payload.causationId as string,
    };

    const data: FraudCheckedEventData = {
      creditId: payload.creditId as string,
      applicantId: payload.applicantId as string,
      fraudCheckId: payload.fraudCheckId as string,
      result: payload.result as FraudCheckResult,
      breakdown: payload.breakdown as FraudCheckBreakdown,
      checkedBy: payload.checkedBy as string,
      processingTimeMs: payload.processingTimeMs as number,
    };

    return new FraudCheckedEvent(metadata, data);
  }

  getEventId(): string {
    return this.metadata.eventId;
  }

  getCreditId(): string {
    return this.data.creditId;
  }

  getCorrelationId(): string {
    return this.metadata.correlationId;
  }

  getOccurredAt(): Date {
    return this.metadata.occurredAt;
  }

  getRiskLevel(): FraudRiskLevel {
    return this.data.result.riskLevel;
  }

  getStatus(): FraudCheckStatus {
    return this.data.result.status;
  }

  getFraudScore(): number {
    return this.data.result.fraudScore;
  }

  getPurpose(): string {
    return (this.data.result.checksPerformed[0] || 'general').toUpperCase();
  }

  getAmount(): number {
    return this.data.processingTimeMs;
  }

  isHighValue(): boolean {
    return this.data.result.fraudScore > 75;
  }

  isHighRiskApplicant(): boolean {
    return this.data.result.riskLevel === FraudRiskLevel.HIGH || 
           this.data.result.riskLevel === FraudRiskLevel.CRITICAL ||
           this.data.result.recommendation === 'REJECT';
  }

  isApproved(): boolean {
    return this.data.result.recommendation === 'APPROVE';
  }

  isRejected(): boolean {
    return this.data.result.recommendation === 'REJECT';
  }

  requiresManualReview(): boolean {
    return this.data.result.recommendation === 'REVIEW';
  }

  isHighRisk(): boolean {
    return this.data.result.riskLevel === FraudRiskLevel.HIGH ||
           this.data.result.riskLevel === FraudRiskLevel.CRITICAL;
  }

  getRecommendation(): string {
    return this.data.result.recommendation;
  }

  getChecksPerformed(): ReadonlyArray<string> {
    return this.data.result.checksPerformed;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      eventType: this.eventType,
      metadata: {
        ...this.metadata,
        occurredAt: this.metadata.occurredAt.toISOString(),
      },
      data: this.data,
    };
  }
}