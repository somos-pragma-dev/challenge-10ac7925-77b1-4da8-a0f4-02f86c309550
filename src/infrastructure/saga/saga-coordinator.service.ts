export enum SagaStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATED = 'COMPENSATED',
}

export interface SagaStep {
  stepName: string;
  compensate?: () => Promise<void>;
  execute?: () => Promise<void>;
  status: SagaStepStatus;
  result?: unknown;
  error?: string;
}

export interface SagaState {
  sagaId: string;
  sagaType: string;
  correlationId: string;
  status: SagaStepStatus;
  steps: SagaStep[];
  startedAt: Date;
  completedAt?: Date;
  payload?: Record<string, unknown>;
  compensationActions?: Array<{ stepName: string; compensate: () => Promise<void> }>;
  currentStepIndex: number;
}

export interface SagaDefinition {
  sagaType: string;
  correlationId: string;
  payload?: Record<string, unknown>;
  steps: SagaStep[];
  compensationActions?: Array<{ stepName: string; compensate: () => Promise<void> }>;
}

export class SagaCoordinatorService {
  private readonly logger = new Logger(SagaCoordinatorService.name);
  private readonly activeSagas: Map<string, SagaState> = new Map();

  constructor() {}

  async executeSaga(definition: SagaDefinition): Promise<SagaState> {
    const sagaState = this.initializeSagaState(definition);
    this.activeSagas.set(sagaState.sagaId, sagaState);
    
    try {
      for (let i = 0; i < sagaState.steps.length; i++) {
        sagaState.currentStepIndex = i;
        const step = sagaState.steps[i];
        step.status = SagaStepStatus.IN_PROGRESS;
        
        if (step.execute) {
          step.result = await step.execute();
        }
        step.status = SagaStepStatus.COMPLETED;
      }
      
      sagaState.status = SagaStepStatus.COMPLETED;
      sagaState.completedAt = new Date();
      this.logger.log(`Saga ${sagaState.sagaId} completed successfully`);
    } catch (error) {
      this.logger.error(`Saga ${sagaState.sagaId} failed: ${error instanceof Error ? error.message : String(error)}`);
      await this.handleSagaFailure(sagaState, error instanceof Error ? error : new Error(String(error)));
    }
    
    return sagaState;
  }

  async startSaga(definition: {
    sagaType: string;
    correlationId: string;
    payload?: Record<string, unknown>;
    compensationActions?: Array<{ stepName: string; compensate: () => Promise<void> }>;
  }): Promise<string> {
    const sagaId = `saga-${definition.correlationId}-${Date.now()}`;
    
    const sagaState: SagaState = {
      sagaId,
      sagaType: definition.sagaType,
      correlationId: definition.correlationId,
      status: SagaStepStatus.PENDING,
      steps: [],
      startedAt: new Date(),
      payload: definition.payload,
      compensationActions: definition.compensationActions,
      currentStepIndex: 0,
    };
    
    this.activeSagas.set(sagaId, sagaState);
    this.logger.log(`Started saga ${sagaId} for correlation ${definition.correlationId}`);
    
    return sagaId;
  }

  async processStep(params: {
    stepName: string;
    correlationId: string;
    result: 'SUCCESS' | 'FAILURE' | 'MANUAL_REVIEW';
    data?: Record<string, unknown>;
  }): Promise<void> {
    const sagaState = this.getSagaByCorrelationId(params.correlationId);
    
    if (!sagaState) {
      this.logger.warn(`Saga not found for correlation ${params.correlationId}`);
      return;
    }
    
    const step = sagaState.steps.find(s => s.stepName === params.stepName);
    if (step) {
      step.result = params.data;
      step.status = params.result === 'SUCCESS' ? SagaStepStatus.COMPLETED : 
                    params.result === 'MANUAL_REVIEW' ? SagaStepStatus.PENDING : 
                    SagaStepStatus.FAILED;
      this.logger.log(`Processed step ${params.stepName} in saga ${sagaState.sagaId} with result ${params.result}`);
    }
  }

  async compensate(params: {
    correlationId: string;
    stepName: string;
    reason: string;
  }): Promise<void> {
    const sagaState = this.getSagaByCorrelationId(params.correlationId);
    
    if (!sagaState) {
      this.logger.warn(`Saga not found for correlation ${params.correlationId}`);
      return;
    }
    
    const compensationActions = sagaState.compensationActions || [];
    const actionToCompensate = compensationActions.find(a => a.stepName === params.stepName);
    
    if (actionToCompensate) {
      try {
        await actionToCompensate.compensate();
        this.logger.log(`Compensated step ${params.stepName} in saga ${sagaState.sagaId}`);
      } catch (error) {
        this.logger.error(`Failed to compensate step ${params.stepName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    sagaState.status = SagaStepStatus.COMPENSATED;
    this.logger.warn(`Saga ${sagaState.sagaId} compensated due to: ${params.reason}`);
  }

  private initializeSagaState(definition: SagaDefinition): SagaState {
    return {
      sagaId: `saga-${definition.correlationId}-${Date.now()}`,
      sagaType: definition.sagaType,
      correlationId: definition.correlationId,
      status: SagaStepStatus.PENDING,
      steps: definition.steps || [],
      startedAt: new Date(),
      payload: definition.payload,
      compensationActions: definition.compensationActions,
      currentStepIndex: 0,
    };
  }

  private async executeStep(sagaState: SagaState, step: SagaStep, index: number): Promise<void> {
    step.status = SagaStepStatus.IN_PROGRESS;
    sagaState.currentStepIndex = index;
    
    if (step.execute) {
      step.result = await step.execute();
    }
    
    step.status = SagaStepStatus.COMPLETED;
  }

  private async handleSagaFailure(sagaState: SagaState, error: Error): Promise<void> {
    sagaState.status = SagaStepStatus.FAILED;
    
    const compensationActions = sagaState.compensationActions || [];
    for (const action of compensationActions) {
      try {
        await action.compensate();
      } catch (compError) {
        this.logger.error(`Compensation failed for ${action.stepName}: ${compError instanceof Error ? compError.message : String(compError)}`);
      }
    }
  }

  private async compensateStep(sagaState: SagaState, step: SagaStep): Promise<void> {
    if (step.compensate) {
      step.status = SagaStepStatus.IN_PROGRESS;
      await step.compensate();
      step.status = SagaStepStatus.COMPENSATED;
    }
  }

  getSagaState(sagaId: string): SagaState | undefined {
    return this.activeSagas.get(sagaId);
  }

  getSagaByCorrelationId(correlationId: string): SagaState | undefined {
    for (const saga of this.activeSagas.values()) {
      if (saga.correlationId === correlationId) {
        return saga;
      }
    }
    return undefined;
  }

  getActiveSagas(): SagaState[] {
    return Array.from(this.activeSagas.values());
  }

  async abortSaga(sagaId: string): Promise<SagaState | undefined> {
    const sagaState = this.activeSagas.get(sagaId);
    if (sagaState) {
      sagaState.status = SagaStepStatus.COMPENSATED;
      this.logger.warn(`Saga ${sagaId} aborted`);
    }
    return sagaState;
  }

  async cleanupCompletedSagas(): Promise<number> {
    let cleaned = 0;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [id, saga] of this.activeSagas.entries()) {
      const age = now - saga.startedAt.getTime();
      if (age > maxAge && (saga.status === SagaStepStatus.COMPLETED || saga.status === SagaStepStatus.COMPENSATED)) {
        this.activeSagas.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}