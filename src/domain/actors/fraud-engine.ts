import { FraudCheckedEvent, FraudCheckResult, FraudRiskLevel, FraudCheckStatus, FraudCheckedEventData, FraudCheckedEventMetadata, FraudCheckBreakdown } from '../events/fraud-checked.event';
import { CreditDetails, CreditApplicant } from '../events/credit-originated.event';
import { ulid } from 'ulid';

export enum FraudEngineStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DEGRADED = 'DEGRADED',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface FraudEngineConfiguration {
  readonly maxConcurrentChecks: number;
  readonly checkTimeoutMs: number;
  readonly enableBreakdown: boolean;
  readonly riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  readonly enabledChecks: readonly string[];
}

export interface FraudEngineMetrics {
  readonly totalChecksPerformed: number;
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly reviewCount: number;
  readonly averageProcessingTimeMs: number;
  readonly lastCheckAt?: Date;
}

export class FraudEngine {
  private readonly engineId: string;
  private status: FraudEngineStatus;
  private configuration: FraudEngineConfiguration;
  private metrics: FraudEngineMetrics;
  private activeChecks: Map<string, { creditId: string; startedAt: Date }>;

  private constructor(
    engineId: string,
    configuration: FraudEngineConfiguration
  ) {
    this.engineId = engineId;
    this.status = FraudEngineStatus.IDLE;
    this.configuration = configuration;
    this.metrics = {
      totalChecksPerformed: 0,
      approvedCount: 0,
      rejectedCount: 0,
      reviewCount: 0,
      averageProcessingTimeMs: 0
    };
    this.activeChecks = new Map();
  }

  static create(configuration: FraudEngineConfiguration): FraudEngine {
    const engineId = `fraud-engine-${ulid()}`;
    return new FraudEngine(engineId, configuration);
  }

  async performFraudCheck(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    correlationId: string
  ): Promise<FraudCheckedEvent> {
    if (this.activeChecks.size >= this.configuration.maxConcurrentChecks) {
      throw new Error(`Fraud engine at capacity: ${this.activeChecks.size}/${this.configuration.maxConcurrentChecks}`);
    }

    this.status = FraudEngineStatus.PROCESSING;
    const checkId = `check-${ulid()}`;
    const startedAt = new Date();
    this.activeChecks.set(checkId, { creditId: creditDetails.creditId, startedAt });

    try {
      const result = await this.executeFraudChecks(creditDetails, applicant);
      const breakdown = this.configuration.enableBreakdown 
        ? this.generateBreakdown(result) 
        : this.getDefaultBreakdown();
      
      const eventData = this.buildEventData(creditDetails, applicant, result, breakdown);
      const metadata = this.buildMetadata(correlationId, checkId);
      
      this.updateMetrics(result, startedAt);
      this.activeChecks.delete(checkId);
      
      return FraudCheckedEvent.create(metadata, eventData);
    } catch (error) {
      this.activeChecks.delete(checkId);
      this.status = FraudEngineStatus.DEGRADED;
      throw error;
    }
  }

  private async executeFraudChecks(
    creditDetails: CreditDetails,
    applicant: CreditApplicant
  ): Promise<FraudCheckResult> {
    const checksPerformed: string[] = [];
    const flags: string[] = [];
    let fraudScore = 0;

    for (const check of this.configuration.enabledChecks) {
      checksPerformed.push(check);
      const checkResult = await this.runIndividualCheck(check, creditDetails, applicant);
      fraudScore += checkResult.score;
      if (checkResult.flag) {
        flags.push(checkResult.flag);
      }
    }

    const riskLevel = this.calculateRiskLevel(fraudScore);
    const status = this.determineStatus(riskLevel, flags);
    const recommendation = this.getRecommendation(riskLevel, flags);

    return {
      status,
      riskLevel,
      fraudScore,
      checksPerformed: Object.freeze([...checksPerformed]),
      flags: Object.freeze([...flags]),
      recommendation
    };
  }

  private async runIndividualCheck(
    checkName: string,
    creditDetails: CreditDetails,
    applicant: CreditApplicant
  ): Promise<{ score: number; flag?: string }> {
    switch (checkName) {
      case 'identity_verification':
        return this.checkIdentity(applicant);
      case 'address_verification':
        return this.checkAddress(applicant);
      case 'income_verification':
        return this.checkIncome(applicant, creditDetails);
      case 'credit_bureau_check':
        return this.checkCreditBureau(applicant);
      case 'velocity_check':
        return this.checkVelocity(applicant, creditDetails);
      case 'device_fingerprint_check':
        return this.checkDeviceFingerprint(applicant);
      case 'biometric_verification':
        return this.checkBiometric(applicant);
      default:
        return { score: 0 };
    }
  }

  private checkIdentity(applicant: CreditApplicant): { score: number; flag?: string } {
    const hasValidDocument = applicant.documentNumber && applicant.documentType;
    const hasValidName = applicant.fullName && applicant.fullName.split(' ').length >= 2;
    
    if (!hasValidDocument) return { score: 30, flag: 'INVALID_DOCUMENT' };
    if (!hasValidName) return { score: 20, flag: 'INVALID_NAME' };
    if (applicant.creditScore < 300) return { score: 25, flag: 'LOW_CREDIT_SCORE' };
    
    return { score: 0 };
  }

  private checkAddress(applicant: CreditApplicant): { score: number; flag?: string } {
    return { score: 5 };
  }

  private checkIncome(applicant: CreditApplicant, creditDetails: CreditDetails): { score: number; flag?: string } {
    const installmentToIncomeRatio = creditDetails.installmentAmount / applicant.monthlyIncome;
    
    if (installmentToIncomeRatio > 0.35) {
      return { score: 25, flag: 'HIGH_DEBT_TO_INCOME' };
    }
    if (installmentToIncomeRatio > 0.25) {
      return { score: 10 };
    }
    
    return { score: 0 };
  }

  private checkCreditBureau(applicant: CreditApplicant): { score: number; flag?: string } {
    if (applicant.creditScore < 400) return { score: 35, flag: 'POOR_CREDIT_HISTORY' };
    if (applicant.creditScore < 600) return { score: 15 };
    
    return { score: 0 };
  }

  private checkVelocity(applicant: CreditApplicant, creditDetails: CreditDetails): { score: number; flag?: string } {
    if (creditDetails.amount > 50000) return { score: 15, flag: 'HIGH_VALUE_REQUEST' };
    
    return { score: 0 };
  }

  private checkDeviceFingerprint(applicant: CreditApplicant): { score: number; flag?: string } {
    return { score: 5 };
  }

  private checkBiometric(applicant: CreditApplicant): { score: number; flag?: string } {
    return { score: 5 };
  }

  private calculateRiskLevel(score: number): FraudRiskLevel {
    const { riskThresholds } = this.configuration;
    
    if (score >= riskThresholds.critical) return FraudRiskLevel.CRITICAL;
    if (score >= riskThresholds.high) return FraudRiskLevel.HIGH;
    if (score >= riskThresholds.medium) return FraudRiskLevel.MEDIUM;
    if (score >= riskThresholds.low) return FraudRiskLevel.LOW;
    
    return FraudRiskLevel.MINIMAL;
  }

  private determineStatus(riskLevel: FraudRiskLevel, flags: string[]): FraudCheckStatus {
    if (flags.length >= 3) return FraudCheckStatus.FAILED;
    if (riskLevel === FraudRiskLevel.CRITICAL) return FraudCheckStatus.FAILED;
    if (riskLevel === FraudRiskLevel.HIGH) return FraudCheckStatus.REVIEW;
    
    return FraudCheckStatus.PASSED;
  }

  private getRecommendation(riskLevel: FraudRiskLevel, flags: string[]): 'APPROVE' | 'REVIEW' | 'REJECT' {
    if (riskLevel === FraudRiskLevel.CRITICAL || flags.includes('INVALID_DOCUMENT')) {
      return 'REJECT';
    }
    if (riskLevel === FraudRiskLevel.HIGH || flags.length >= 2) {
      return 'REVIEW';
    }
    
    return 'APPROVE';
  }

  private generateBreakdown(result: FraudCheckResult): FraudCheckBreakdown {
    const checks = result.checksPerformed;
    
    return {
      identityVerification: checks.includes('identity_verification'),
      addressVerification: checks.includes('address_verification'),
      incomeVerification: checks.includes('income_verification'),
      creditBureauCheck: checks.includes('credit_bureau_check'),
      velocityCheck: checks.includes('velocity_check'),
      deviceFingerprintCheck: checks.includes('device_fingerprint_check'),
      biometricVerification: checks.includes('biometric_verification')
    };
  }

  private getDefaultBreakdown(): FraudCheckBreakdown {
    return {
      identityVerification: false,
      addressVerification: false,
      incomeVerification: false,
      creditBureauCheck: false,
      velocityCheck: false,
      deviceFingerprintCheck: false,
      biometricVerification: false
    };
  }

  private buildMetadata(correlationId: string, checkId: string): FraudCheckedEventMetadata {
    return {
      eventId: `evt-${ulid()}`,
      occurredAt: new Date(),
      version: '1.0.0',
      correlationId,
      causationId: checkId
    };
  }

  private buildEventData(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    result: FraudCheckResult,
    breakdown: FraudCheckBreakdown
  ): FraudCheckedEventData {
    return {
      creditId: creditDetails.creditId,
      applicantId: applicant.applicantId,
      fraudCheckId: `check-${ulid()}`,
      result,
      breakdown,
      checkedBy: this.engineId,
      processingTimeMs: 0
    };
  }

  private updateMetrics(result: FraudCheckResult, startedAt: Date): void {
    const processingTime = Date.now() - startedAt.getTime();
    const totalChecks = this.metrics.totalChecksPerformed + 1;
    
    this.metrics = {
      totalChecksPerformed: totalChecks,
      approvedCount: this.metrics.approvedCount + (result.recommendation === 'APPROVE' ? 1 : 0),
      rejectedCount: this.metrics.rejectedCount + (result.recommendation === 'REJECT' ? 1 : 0),
      reviewCount: this.metrics.reviewCount + (result.recommendation === 'REVIEW' ? 1 : 0),
      averageProcessingTimeMs: ((this.metrics.averageProcessingTimeMs * this.metrics.totalChecksPerformed) + processingTime) / totalChecks,
      lastCheckAt: new Date()
    };
  }

  getEngineId(): string {
    return this.engineId;
  }

  getStatus(): FraudEngineStatus {
    return this.status;
  }

  getMetrics(): Readonly<FraudEngineMetrics> {
    return { ...this.metrics };
  }

  getConfiguration(): Readonly<FraudEngineConfiguration> {
    return { ...this.configuration };
  }

  getActiveCheckCount(): number {
    return this.activeChecks.size;
  }

  isAvailable(): boolean {
    return this.status === FraudEngineStatus.IDLE && 
           this.activeChecks.size < this.configuration.maxConcurrentChecks;
  }

  setStatus(status: FraudEngineStatus): void {
    this.status = status;
  }

  suspend(): void {
    this.status = FraudEngineStatus.UNAVAILABLE;
  }

  resume(): void {
    this.status = FraudEngineStatus.IDLE;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      engineId: this.engineId,
      status: this.status,
      configuration: this.configuration,
      metrics: this.metrics,
      activeCheckCount: this.activeChecks.size
    };
  }
}