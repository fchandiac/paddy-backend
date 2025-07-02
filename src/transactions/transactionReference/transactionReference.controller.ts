import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionReferenceService } from './transactionReference.service';
import { TransactionReference } from '../../../libs/entities/transaction-reference.entity';

@Controller('transaction-reference')
export class TransactionReferenceController {
  constructor(private readonly transactionReferenceService: TransactionReferenceService) {}

  @Get('health')
  async getHealth(): Promise<string> {
    return await this.transactionReferenceService.health();
  }

  @Post()
  async createReference(
    @Body() data: { transactionCode: string; producerId: number; parentId: number; childId: number; parentType?: string }
  ): Promise<TransactionReference> {
    return this.transactionReferenceService.createReference(
      data.transactionCode,
      data.producerId,
      data.parentId,
      data.childId,
      data.parentType || 'Transaction'
    );
  }

  @Get('transaction/:id/parent')
  async findParentReferences(
    @Param('id', ParseIntPipe) id: number
  ): Promise<TransactionReference[]> {
    return this.transactionReferenceService.findReferencesForTransaction(id, true);
  }

  @Get('transaction/:id/child')
  async findChildReferences(
    @Param('id', ParseIntPipe) id: number
  ): Promise<TransactionReference[]> {
    return this.transactionReferenceService.findReferencesForTransaction(id, false);
  }

  @Get('producer/:id')
  async findByProducer(
    @Param('id', ParseIntPipe) id: number
  ): Promise<TransactionReference[]> {
    return this.transactionReferenceService.findByProducer(id);
  }
}
