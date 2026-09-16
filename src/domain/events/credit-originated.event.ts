import { ulid } from 'ulid';

export interface CreditOriginatedEventMetadata {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly version: string;
  readonly correlationId: string;
  readonly causationId?: string;
}

export interface CreditApplicant {
  readonly applicantId: string;
  readonly fullName: string;
  readonly email: string;
  readonly documentType: 'CPF' | 'CNPJ' | 'PASSPORT';
  readonly documentNumber: string;
  readonly monthlyIncome: number;
  readonly creditScore: number;
}

export interface CreditDetails {
  readonly creditId: string;
  readonly amount: number;
  readonly currency: string;
  readonly termMonths: number;
  readonly interestRate: number;
  readonly purpose: 'PERSONAL' | 'BUSINESS' | 'REFINANCING' | 'CONSIGNMENT';
  readonly installmentAmount: number;
  readonly firstPaymentDate: Date;
}

export interface CreditOriginatedEventData {
  readonly credit: CreditDetails;
  readonly applicant: CreditApplicant;
  readonly originators: ReadonlyArray<string>;
  readonly approvedBy: string;
  readonly channel: string;
}

export class CreditOriginatedEvent {
  readonly eventType = 'CreditOriginated' as const;
  readonly metadata: CreditOriginatedEventMetadata;
  readonly data: CreditOriginatedEventData;

  private constructor(
    metadata: CreditOriginatedEventMetadata,
    data: CreditOriginatedEventData,
  ) {
    this.metadata = metadata;
    this.data = data;
  }

  static create(
    creditDetails: CreditDetails,
    applicant: CreditApplicant,
    correlationId: string,
    approvedBy: string,
    channel: string = 'DIGITAL_PLATFORM',
  ): CreditOriginatedEvent {
    const eventId = ulid();
    const occurredAt = new Date();
    const version = '1.0.0';

    const metadata: CreditOriginatedEventMetadata = {
      eventId,
      occurredAt,
      version,
      correlationId,
      causationId: undefined,
    };

    const data: CreditOriginatedEventData = {
      credit: creditDetails,
      applicant,
      originators: ['CREDIT_ORIGINATION_SYSTEM'],
      approvedBy,
      channel,
    };

    return new CreditOriginatedEvent(metadata, data);
  }

  static fromPayload(payload: {
    metadata: CreditOriginatedEventMetadata;
    data: CreditOriginatedEventData;
  }): CreditOriginatedEvent {
    return new CreditOriginatedEvent(payload.metadata, payload.data);
  }

  getEventId(): string {
    return this.metadata.eventId;
  }

  getCreditId(): string {
    return this.data.credit.creditId;
  }

  getCorrelationId(): string {
    return this.metadata.correlationId;
  }

  getOccurredAt(): Date {
    return this.metadata.occurredAt;
  }

  getApplicantId(): string {
    return this.data.applicant.applicantId;
  }

  getAmount(): number {
    return this.data.credit.amount;
  }

  getPurpose(): string {
    return this.data.credit.purpose;
  }

  isHighValue(): boolean {
    return this.data.credit.amount >= 100000;
  }

  isHighRiskApplicant(): boolean {
    return this.data.applicant.creditScore < 600;
  }

  toPlainObject(): {
    eventType: string;
    metadata: CreditOriginatedEventMetadata;
    data: CreditOriginatedEventData;
  } {
    return {
      eventType: this.eventType,
      metadata: {
        ...this.metadata,
        occurredAt: this.metadata.occurredAt,
      },
      data: this.data,
    };
  }
}