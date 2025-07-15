import { Controller, Get, Post, Body, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { TransactionReferenceService } from './transactionReference.service';
import { TransactionReference } from '../../../libs/entities/transaction-reference.entity';

@Controller('transaction-reference')
@UseInterceptors(AuditInterceptor)
export class TransactionReferenceController {
  constructor(private readonly transactionReferenceService: TransactionReferenceService) {}

  @Get('health')
  @Audit('VIEW', 'TRANSACTION', 'Verificar salud del servicio de referencias de transacción')
  async getHealth(): Promise<string> {
    return await this.transactionReferenceService.health();
  }

  @Post()
  @Audit('CREATE', 'TRANSACTION', 'Crear referencia de transacción')
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
