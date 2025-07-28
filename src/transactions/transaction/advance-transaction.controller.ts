import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { AdvanceTransactionService } from './advance-transaction.service';
import { CreateAdvanceTransactionDto } from 'libs/dto/advance-transaction.dto';
import { Transaction } from 'libs/entities/transaction.entity';

@Controller('advance-transactions')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class AdvanceTransactionController {
  constructor(private readonly advanceTransactionService: AdvanceTransactionService) {}

  @Post()
  @Audit('CREATE', 'TRANSACTION', 'Crear transacción de anticipo')
  async createAdvance(@Body() dto: CreateAdvanceTransactionDto): Promise<Transaction> {
    return this.advanceTransactionService.create(dto);
  }
}
