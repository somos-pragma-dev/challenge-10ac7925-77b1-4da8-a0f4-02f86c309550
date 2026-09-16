import { Module, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventPublisherService } from '@application/services/event-publisher.service';
import { ProcessCreditUseCase } from '@application/use-cases/process-credit.usecase';
import { CreditOriginator } from '@domain/actors/credit-originator';
import awsConfig from '@infrastructure/config/aws.config';
import kafkaConfig from '@infrastructure/config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig, kafkaConfig],
      envFilePath: '.env',
      validationOptions: {
        allowUnknownKeys: true,
        stripUnknown: true,
      },
    }),
  ],
  providers: [
    {
      provide: 'Logger',
      useValue: new Logger('Application'),
    },
    {
      provide: 'MessageBroker',
      useFactory: async (configService: ConfigService) => {
        const brokerType = configService.get<string>('messageBroker.type', { infer: true }) || 'kafka';
        const { MessageBrokerFactory } = await import('./infrastructure/message-brokers/message-broker.factory');
        return MessageBrokerFactory.create(brokerType, configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'OutboxRepository',
      useFactory: async (configService: ConfigService) => {
        const dbType = configService.get<string>('database.outbox.type', { infer: true }) || 'dynamodb';
        const { OutboxRepositoryFactory } = await import('./infrastructure/outbox/outbox-repository.factory');
        return OutboxRepositoryFactory.create(dbType, configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'SagaCoordinator',
      useFactory: async (
        configService: ConfigService,
        @Inject('OutboxRepository') outboxRepository: any,
      ) => {
        const { SagaCoordinatorService } = await import('./infrastructure/saga/saga-coordinator.service');
        return new SagaCoordinatorService(
          outboxRepository,
          configService,
          new Logger('SagaCoordinator'),
        );
      },
      inject: [ConfigService, 'OutboxRepository'],
    },
    {
      provide: 'CreditOriginator',
      useFactory: (configService: ConfigService) => {
        return CreditOriginator.create({
          originatorId: configService.get<string>('originator.id', { infer: true }) || 'ORIG-001',
          name: configService.get<string>('originator.name', { infer: true }) || 'Premium Credit Originator',
          type: 'BANK' as any,
          status: 'ACTIVE' as any,
          configuration: {
            maxSingleCreditAmount: configService.get<number>('originator.maxSingleCreditAmount', { infer: true }) || 100000,
            maxMonthlyCreditVolume: configService.get<number>('originator.maxMonthlyCreditVolume', { infer: true }) || 5000000,
            allowedCreditPurposes: ['PERSONAL', 'BUSINESS', 'REFINANCING', 'CONSIGNMENT'],
            requiresManualApproval: false,
            approvalThreshold: 750,
          },
        });
      },
      inject: [ConfigService],
    },
    EventPublisherService,
    ProcessCreditUseCase,
  ],
  exports: [
    EventPublisherService,
    ProcessCreditUseCase,
    'MessageBroker',
    'OutboxRepository',
    'SagaCoordinator',
    'CreditOriginator',
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppModule.name);
  private messageBroker: any;
  private outboxRepository: any;

  constructor(
    @Inject('MessageBroker') messageBroker: any,
    @Inject('OutboxRepository') outboxRepository: any,
  ) {
    this.messageBroker = messageBroker;
    this.outboxRepository = outboxRepository;
  }

  async onModuleInit() {
    this.logger.log('Initializing event-driven credit processing application');
    
    try {
      if (this.messageBroker && typeof this.messageBroker.connect === 'function') {
        await this.messageBroker.connect();
        this.logger.log('Message broker connected successfully');
      }

      if (this.outboxRepository && typeof this.outboxRepository.initialize === 'function') {
        await this.outboxRepository.initialize();
        this.logger.log('Outbox repository initialized successfully');
      }

      this.logger.log(
        'Event-driven outbox pattern system initialized successfully. ' +
        'Distributed saga coordinator ready.',
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize application: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down event-driven credit processing application');
    
    try {
      if (this.messageBroker && typeof this.messageBroker.disconnect === 'function') {
        await this.messageBroker.disconnect();
        this.logger.log('Message broker disconnected successfully');
      }

      this.logger.log('Application shutdown complete');
    } catch (error) {
      this.logger.error(
        `Error during shutdown: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}