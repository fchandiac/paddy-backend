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
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';
import { Transaction } from 'libs/entities/transaction.entity';
import { GenerateInterestDto } from 'libs/dto/interest.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // Endpoint para verificar estado del servicio
  @Get('health')
  async health() {
    return this.transactionService.health();
  }

  // Obtener todas las transacciones, con filtros opcionales por query params
  @Get()
  async findAll(@Query() filter: FilterTransactionDto): Promise<Transaction[]> {
    return this.transactionService.findAll(filter);
  }

  // Obtener una transacción específica por ID
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Transaction> {
    return this.transactionService.findById(id);
  }

  // Crear una nueva transacción
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  @Get('producer/:producerId')
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
