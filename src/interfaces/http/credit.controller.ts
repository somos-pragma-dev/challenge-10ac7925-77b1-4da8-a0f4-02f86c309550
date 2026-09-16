import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Logger, Inject } from '@nestjs/common';
import { CreateCreditRequestDTO } from '@application/dto/create-credit-request.dto';
import { ProcessCreditUseCase } from '@application/use-cases/process-credit.usecase';
import { EventPublisherService } from '@application/services/event-publisher.service';
import { CreditOriginatedEvent } from '@domain/events/credit-originated.event';
import { CreditApplicant, CreditDetails } from '@domain/events/credit-originated.event';

@Controller('credits')
export class CreditController {
  private readonly logger = new Logger(CreditController.name);

  constructor(
    private readonly processCreditUseCase: ProcessCreditUseCase,
    private readonly eventPublisherService: EventPublisherService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async initiateCreditProcessing(@Body() request: CreateCreditRequestDTO): Promise<{ creditId: string; status: string }> {
    this.logger.log(`Received credit processing request for applicant: ${request.applicantId}`);

    try {
      const creditDetails: CreditDetails = {
        creditId: request.creditId,
        amount: request.amount,
        currency: request.currency || 'BRL',
        termMonths: request.termMonths,
        interestRate: request.interestRate,
        purpose: request.purpose,
        installmentAmount: this.calculateInstallmentAmount(
          request.amount,
          request.termMonths,
          request.interestRate
        ),
        firstPaymentDate: request.firstPaymentDate,
      };

      const applicant: CreditApplicant = {
        applicantId: request.applicantId,
        fullName: request.fullName,
        email: request.email,
        documentType: request.documentType,
        documentNumber: request.documentNumber,
        monthlyIncome: request.monthlyIncome,
        creditScore: request.creditScore,
      };

      const event = CreditOriginatedEvent.create({
        credit: creditDetails,
        applicant,
        originators: [request.originatorId],
        approvedBy: 'credit-system',
        channel: 'http-api',
      });

      await this.eventPublisherService.publishCreditOriginatedEvent(event);

      this.logger.log(`Credit processing initiated for creditId: ${request.creditId}, eventId: ${event.getEventId()}`);

      return {
        creditId: request.creditId,
        status: 'PROCESSING',
      };
    } catch (error) {
      this.logger.error(`Failed to initiate credit processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':creditId')
  async getCreditStatus(@Param('creditId') creditId: string): Promise<{ creditId: string; status: string }> {
    this.logger.log(`Fetching status for creditId: ${creditId}`);
    
    return {
      creditId,
      status: 'PROCESSING',
    };
  }

  private calculateInstallmentAmount(amount: number, termMonths: number, annualInterestRate: number): number {
    const monthlyRate = annualInterestRate / 12 / 100;
    if (monthlyRate === 0) {
      return amount / termMonths;
    }
    const factor = Math.pow(1 + monthlyRate, termMonths);
    return (amount * monthlyRate * factor) / (factor - 1);
  }
}