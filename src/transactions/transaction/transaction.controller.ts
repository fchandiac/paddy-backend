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
} from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';
import { Transaction } from 'libs/entities/transaction.entity';
import { GenerateInterestDto } from 'libs/dto/interest.dto';

@Controller('transactions')
@UseInterceptors(AuditInterceptor)
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
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  @Get('producer/:producerId')
  @Audit('VIEW', 'TRANSACTION', 'Listar transacciones por productor')
  async findAllByProducer(
    @Param('producerId', ParseIntPipe) producerId: number,
  ): Promise<Transaction[]> {
    return this.transactionService.findAllByProducer(producerId);
  }

  @Get('advance/:id/interest')
  async calculateAdvanceInterest(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') dateStr?: string,
  ): Promise<{ interestAmount: number }> {
    const transaction = await this.transactionService.findById(id);

    // Si se proporciona una fecha de referencia, usarla; de lo contrario, usar la fecha actual
    const referenceDate = dateStr ? new Date(dateStr) : new Date();
    if (dateStr && isNaN(referenceDate.getTime())) {
      throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    const interestAmount = await this.transactionService.calculateAdvanceInterest(
      transaction,
      referenceDate,
    );
    return { interestAmount };
  }

  @Post('advance/:id/generate-interest')
  @Audit('CREATE', 'TRANSACTION', 'Generar transacción de interés')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async generateInterestTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GenerateInterestDto,
  ): Promise<Transaction> {
    // Si se proporciona una fecha de referencia, usarla; de lo contrario, usar la fecha actual
    const referenceDate = dto.date ? new Date(dto.date) : new Date();
    if (dto.date && isNaN(referenceDate.getTime())) {
      throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
    }
    return this.transactionService.generateInterestTransaction(id, dto.userId, referenceDate);
  }
}
