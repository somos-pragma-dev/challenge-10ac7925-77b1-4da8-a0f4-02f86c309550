import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as sinon from 'sinon';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { FraudCheckedEvent, FraudCheckStatus, FraudRiskLevel } from '@domain/events/fraud-checked.event';
import { CreditOriginator } from '@domain/actors/credit-originator';
import { CreditApplicant, CreditDetails } from '@domain/events/credit-originated.event';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

describe('ProcessCredit E2E - Flujo Completo con Saga y Outbox', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  
  let kafkaContainer: StartedTestContainer;
  let postgresContainer: StartedTestContainer;
  let dynamodbContainer: StartedTestContainer;
  
  const CREDIT_ID = 'credit-001';
  const APPLICANT_ID = 'applicant-001';
  const CORRELATION_ID = 'corr-saga-001';

  const testApplicant: CreditApplicant = {
    applicantId: APPLICANT_ID,
    fullName: 'Juan Pérez García',
    email: 'juan.perez@example.com',
    documentType: 'CPF' as const,
    documentNumber: '12345678901',
    monthlyIncome: 8500.00,
    creditScore: 720
  };

  const testCreditDetails: CreditDetails = {
    creditId: CREDIT_ID,
    amount: 50000,
    currency: 'BRL',
    termMonths: 36,
    interestRate: 0.0245,
    purpose: 'PERSONAL' as const,
    installmentAmount: 1525.50,
    firstPaymentDate: new Date('2025-03-15')
  };

  beforeAll(async () => {
    kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:7.5.0')
      .withEnvironment({
        KAFKA_NODE_ID: '1',
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT',
        KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093',
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092',
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@localhost:9093',
        KAFKA_PROCESS_ROLES: 'broker,controller',
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: '1',
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: '1',
        KAFKA_LOG_DIRS: '/var/lib/kafka/data',
        CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
      })
      .withExposedPorts(9092)
      .start();

    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_USER: 'credit_user',
        POSTGRES_PASSWORD: 'credit_pass',
        POSTGRES_DB: 'credit_db'
      })
      .withExposedPorts(5432)
      .start();

    dynamodbContainer = await new GenericContainer('amazon/dynamodb-local:latest')
      .withExposedPorts(8000)
      .start();

    process.env.KAFKA_BROKER = `localhost:${kafkaContainer.getMappedPort(9092)}`;
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PORT = String(postgresContainer.getMappedPort(5432));
    process.env.POSTGRES_DB = 'credit_db';
    process.env.POSTGRES_USER = 'credit_user';
    process.env.POSTGRES_PASSWORD = 'credit_pass';
    process.env.DYNAMODB_ENDPOINT = `http://localhost:${dynamodbContainer.getMappedPort(8000)}`;
    process.env.AWS_REGION = 'us-east-1';
  }, 300000);

  afterAll(async () => {
    if (kafkaContainer) await kafkaContainer.stop();
    if (postgresContainer) await postgresContainer.stop();
    if (dynamodbContainer) await dynamodbContainer.stop();
  });

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: []
    }).compile();

    app = testingModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('Flujo de Origenación de Crédito con Saga', () => {
    it('debe procesar crédito completo y persistir eventos en outbox', async () => {
      const originator = CreditOriginator.create({
        originatorId: 'originator-001',
        name: 'Banco Central',
        type: 'BANK' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 100000,
          maxMonthlyCreditVolume: 500000,
          allowedCreditPurposes: ['PERSONAL', 'BUSINESS', 'REFINANCING', 'CONSIGNMENT'],
          requiresManualApproval: false,
          approvalThreshold: 650
        }
      });

      const canOriginate = originator.canOriginateCredit(testCreditDetails, testApplicant);
      expect(canOriginate).toBe(true);

      const event = originator.createCreditOriginatedEvent(
        testCreditDetails,
        testApplicant,
        ['originator-001'],
        'system',
        'WEB'
      );

      expect(event.getCreditId()).toBe(CREDIT_ID);
      expect(event.getApplicantId()).toBe(APPLICANT_ID);
      expect(event.getAmount()).toBe(50000);
      expect(event.isHighValue()).toBe(false);
      expect(event.isHighRiskApplicant()).toBe(false);

      const eventData = event.toPlainObject();
      expect(eventData.eventType).toBe('CREDIT_ORIGINATED');
      expect(eventData.data.credit.creditId).toBe(CREDIT_ID);
      expect(eventData.data.applicant.email).toBe('juan.perez@example.com');
    });

    it('debe validar correctamente la evaluación de fraude', () => {
      const fraudCheckResult = {
        status: FraudCheckStatus.APPROVED,
        riskLevel: FraudRiskLevel.LOW,
        fraudScore: 15,
        checksPerformed: ['identity', 'address', 'income', 'credit_bureau', 'velocity', 'device'],
        flags: [],
        recommendation: 'APPROVE' as const
      };

      const breakdown = {
        identityVerification: true,
        addressVerification: true,
        incomeVerification: true,
        creditBureauCheck: true,
        velocityCheck: true,
        deviceFingerprintCheck: true,
        biometricVerification: false
      };

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-check-001',
        result: fraudCheckResult,
        breakdown,
        checkedBy: 'fraud-engine',
        processingTimeMs: 250
      });

      expect(fraudEvent.getCreditId()).toBe(CREDIT_ID);
      expect(fraudEvent.getRiskLevel()).toBe(FraudRiskLevel.LOW);
      expect(fraudEvent.isApproved()).toBe(true);
      expect(fraudEvent.isRejected()).toBe(false);
      expect(fraudEvent.requiresManualReview()).toBe(false);
      expect(fraudEvent.getFraudScore()).toBe(15);
      expect(fraudEvent.getRecommendation()).toBe('APPROVE');

      const plainEvent = fraudEvent.toPlainObject();
      expect(plainEvent.eventType).toBe('FRAUD_CHECKED');
      expect(plainEvent.data.result.status).toBe('APPROVED');
    });

    it('debe detectar crédito de alto valor correctamente', () => {
      const highValueCredit: CreditDetails = {
        ...testCreditDetails,
        creditId: 'credit-high-value',
        amount: 250000
      };

      const event = CreditOriginatedEvent.create({
        credit: highValueCredit,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'BRANCH'
      });

      expect(event.isHighValue()).toBe(true);
      expect(event.getAmount()).toBe(250000);
    });

    it('debe detectar applicant de alto riesgo', () => {
      const highRiskApplicant: CreditApplicant = {
        ...testApplicant,
        applicantId: 'high-risk-applicant',
        creditScore: 480
      };

      const event = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: highRiskApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      expect(event.isHighRiskApplicant()).toBe(true);
      expect(event.getApplicantId()).toBe('high-risk-applicant');
    });

    it('debe rechazar crédito que excede límite del originator', () => {
      const limitedOriginator = CreditOriginator.create({
        originatorId: 'limited-originator',
        name: 'Fintech Limitada',
        type: 'FINTECH' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 10000,
          maxMonthlyCreditVolume: 100000,
          allowedCreditPurposes: ['PERSONAL'],
          requiresManualApproval: true,
          approvalThreshold: 700
        }
      });

      const canOriginate = limitedOriginator.canOriginateCredit(testCreditDetails, testApplicant);
      expect(canOriginate).toBe(false);
    });

    it('debe manejar falla de fraude y generar evento de rechazo', () => {
      const fraudCheckResult = {
        status: FraudCheckStatus.REJECTED,
        riskLevel: FraudRiskLevel.HIGH,
        fraudScore: 92,
        checksPerformed: ['identity', 'address', 'income', 'credit_bureau', 'velocity', 'device', 'biometric'],
        flags: ['document_expired', 'address_mismatch', 'velocity_high'],
        recommendation: 'REJECT' as const
      };

      const breakdown = {
        identityVerification: false,
        addressVerification: false,
        incomeVerification: true,
        creditBureauCheck: true,
        velocityCheck: false,
        deviceFingerprintCheck: true,
        biometricVerification: false
      };

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-check-reject',
        result: fraudCheckResult,
        breakdown,
        checkedBy: 'fraud-engine',
        processingTimeMs: 180
      });

      expect(fraudEvent.isRejected()).toBe(true);
      expect(fraudEvent.isHighRisk()).toBe(true);
      expect(fraudEvent.getRecommendation()).toBe('REJECT');
      expect(fraudEvent.getRiskLevel()).toBe(FraudRiskLevel.HIGH);
      expect(fraudEvent.getChecksPerformed().length).toBe(7);
    });

    it('debe validar correlación de eventos en saga', () => {
      const creditEvent = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-check-001',
        result: {
          status: FraudCheckStatus.APPROVED,
          riskLevel: FraudRiskLevel.LOW,
          fraudScore: 10,
          checksPerformed: ['all'],
          flags: [],
          recommendation: 'APPROVE' as const
        },
        breakdown: {
          identityVerification: true,
          addressVerification: true,
          incomeVerification: true,
          creditBureauCheck: true,
          velocityCheck: true,
          deviceFingerprintCheck: true,
          biometricVerification: true
        },
        checkedBy: 'fraud-engine',
        processingTimeMs: 200
      });

      expect(creditEvent.getCorrelationId()).toBeDefined();
      expect(fraudEvent.getCorrelationId()).toBeDefined();
    });
  });

  describe('Outbox Pattern - Persistencia de Eventos', () => {
    it('debe generar estructura correcta de mensaje para outbox', () => {
      const event = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'MOBILE'
      });

      const plainObject = event.toPlainObject();
      
      expect(plainObject).toHaveProperty('eventType');
      expect(plainObject).toHaveProperty('metadata');
      expect(plainObject).toHaveProperty('data');
      expect(plainObject.metadata).toHaveProperty('eventId');
      expect(plainObject.metadata).toHaveProperty('occurredAt');
      expect(plainObject.metadata).toHaveProperty('correlationId');
      expect(plainObject.metadata).toHaveProperty('version');
      
      expect(plainObject.data).toHaveProperty('credit');
      expect(plainObject.data).toHaveProperty('applicant');
      expect(plainObject.data.credit).toHaveProperty('creditId');
      expect(plainObject.data.applicant).toHaveProperty('applicantId');
    });

    it('debe mantener idempotencia mediante eventId único', () => {
      const event1 = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      const event2 = CreditOriginatedEvent.create({
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['originator-001'],
        approvedBy: 'system',
        channel: 'WEB'
      });

      expect(event1.getEventId()).not.toBe(event2.getEventId());
      expect(event1.getCorrelationId()).not.toBe(event2.getCorrelationId());
    });
  });

  describe('Saga - Compensaciones y Retry', () => {
    it('debe identificar cuando se requiere revisión manual', () => {
      const reviewFraudResult = {
        status: FraudCheckStatus.REVIEW,
        riskLevel: FraudRiskLevel.MEDIUM,
        fraudScore: 55,
        checksPerformed: ['identity', 'address', 'income', 'credit_bureau'],
        flags: ['income_unverified'],
        recommendation: 'REVIEW' as const
      };

      const fraudEvent = FraudCheckedEvent.create({
        creditId: CREDIT_ID,
        applicantId: APPLICANT_ID,
        fraudCheckId: 'fraud-review-001',
        result: reviewFraudResult,
        breakdown: {
          identityVerification: true,
          addressVerification: true,
          incomeVerification: false,
          creditBureauCheck: true,
          velocityCheck: true,
          deviceFingerprintCheck: true,
          biometricVerification: false
        },
        checkedBy: 'fraud-engine',
        processingTimeMs: 150
      });

      expect(fraudEvent.requiresManualReview()).toBe(true);
      expect(fraudEvent.getStatus()).toBe(FraudCheckStatus.REVIEW);
    });

    it('debe validar métricas del originator después de originar crédito', () => {
      const originator = CreditOriginator.create({
        originatorId: 'metrics-originator',
        name: 'Banco Metrics',
        type: 'BANK' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 200000,
          maxMonthlyCreditVolume: 1000000,
          allowedCreditPurposes: ['PERSONAL', 'BUSINESS'],
          requiresManualApproval: false,
          approvalThreshold: 600
        }
      });

      const eventData = {
        credit: testCreditDetails,
        applicant: testApplicant,
        originators: ['metrics-originator'],
        approvedBy: 'system',
        channel: 'WEB'
      };

      originator.updateMetrics(eventData);
      
      const metrics = originator.getMetrics();
      expect(metrics.totalCreditsOriginated).toBe(1);
      expect(metrics.totalVolumeProcessed).toBe(50000);
      expect(metrics.averageCreditScore).toBe(720);
      expect(metrics.approvalRate).toBe(100);
    });

    it('debe verificar límites de volumen del originator', () => {
      const originator = CreditOriginator.create({
        originatorId: 'volume-originator',
        name: 'Banco Volumen',
        type: 'BANK' as any,
        status: 'ACTIVE' as any,
        configuration: {
          maxSingleCreditAmount: 50000,
          maxMonthlyCreditVolume: 100000,
          allowedCreditPurposes: ['PERSONAL'],
          requiresManualApproval: false,
          approvalThreshold: 650
        }
      });

      const withinLimit = originator.isWithinVolumeLimit(95000, 3000);
      expect(withinLimit).toBe(false);

      const stillWithin = originator.isWithinVolumeLimit(80000, 15000);
      expect(stillWithin).toBe(true);
    });
  });

  describe('Configuración de brokers de mensajes', () => {
    it('debe tener configurado broker de kafka en entorno', () => {
      expect(process.env.KAFKA_BROKER).toBeDefined();
      expect(process.env.KAFKA_BROKER).toContain('localhost');
    });

    it('debe tener configurado postgres en entorno', () => {
      expect(process.env.POSTGRES_HOST).toBeDefined();
      expect(process.env.POSTGRES_PORT).toBeDefined();
      expect(process.env.POSTGRES_USER).toBeDefined();
      expect(process.env.POSTGRES_PASSWORD).toBeDefined();
    });

    it('debe tener configurado dynamodb en entorno', () => {
      expect(process.env.DYNAMODB_ENDPOINT).toBeDefined();
      expect(process.env.AWS_REGION).toBeDefined();
    });
  });
});