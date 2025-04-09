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
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';
import { Transaction } from 'libs/entities/transaction.entity';

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

}
