import { Controller, Get } from '@nestjs/common';
import { TransactionReferenceService } from './transactionReference.service';

@Controller('transaction-reference')
export class TransactionReferenceController {
  constructor(private readonly transactionReferenceService: TransactionReferenceService) {}

  @Get('health')
  async getHealth(): Promise<string> {
    return await this.transactionReferenceService.health();
  }
}
