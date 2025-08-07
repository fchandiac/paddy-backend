import { CreateDiscountTransactionDto } from 'libs/dto/discount-transaction.dto';

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';
import { TransactionTypeCode } from 'libs/enums';
import { Transaction } from 'libs/entities/transaction.entity';

@Controller('transactions')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // Endpoint para verificar estado del servicio
  @Get('health')
  @Audit('VIEW', 'TRANSACTION', 'Verificar salud del servicio de transacciones')
  async health() {
    return this.transactionService.health();
  }

  // Obtener todas las transacciones, con filtros opcionales por query params
  @Get()
  // --- AUDITORÍA DE CONSULTAS ---
  // Si quieres auditar solo las consultas hechas manualmente por el usuario (y no las automáticas de la UI),
  // usa el decorador @AuditUserQuery en vez de @Audit. Ejemplo:
  // @AuditUserQuery('VIEW', 'TRANSACTION', 'Consulta de transacciones por usuario')
  // El frontend debe enviar el header X-Request-Source: 'USER' para consultas manuales,
  // o 'UI_AUTO' para consultas automáticas (grillas, autocompletados, etc).
  // Si usas @Audit, todas las consultas serán auditadas sin distinción.
  @Audit('VIEW', 'TRANSACTION', 'Listar todas las transacciones')
  async findAll(@Query() filter: FilterTransactionDto): Promise<Transaction[]> {
    return this.transactionService.findAll(filter);
  }

  // Obtener una transacción específica por ID
  @Get(':id')
  @Audit('VIEW', 'TRANSACTION', 'Buscar transacción por ID')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Transaction> {
    return this.transactionService.findById(id);
  }

  // Crear una nueva transacción
  @Post()
  @Audit('CREATE', 'TRANSACTION', 'Crear transacción')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() dto: CreateTransactionDto,
    @Request() req: any,
  ): Promise<Transaction> {
    const userId = req.user?.id;
    return this.transactionService.create(dto, userId);
  }

  @Get('producer/:producerId')
  @Audit('VIEW', 'TRANSACTION', 'Listar transacciones por productor')
  async findAllByProducer(
    @Param('producerId', ParseIntPipe) producerId: number,
  ): Promise<Transaction[]> {
    return this.transactionService.findAllByProducer(producerId);
  }

  // El endpoint de anticipo se puede eliminar, ya que la lógica se unifica en el endpoint general
}
