import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { ProducerService } from './producer.service';
import {
  AddBankAccountDto,
  CreateProducerDto,
  CreateProducerWithBankDto,
  UpdateProducerDto,
} from '../../../libs/dto/producer.dto';
import { Producer } from '../../../libs/entities/producer.entity';

@Controller('producers')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get('health')
  async health(): Promise<string> {
    return this.producerService.health();
  }

  @Get()
  async findAll(): Promise<Producer[]> {
    return this.producerService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Producer> {
    return this.producerService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateProducerDto): Promise<Producer> {
    return this.producerService.create(dto);
  }

  @Post('with-bank')
  async createWithBankAccount(
    @Body() dto: CreateProducerWithBankDto,
  ): Promise<Producer> {
    return this.producerService.createWithBankAccount(dto);
  }

  @Patch(':id/add-bank-account')
  async addBankAccount(
    @Param('id') producerId: number,
    @Body() dto: AddBankAccountDto,
  ): Promise<Producer> {
    return this.producerService.addBankAccount(producerId, dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProducerDto,
  ): Promise<Producer> {
    return this.producerService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.producerService.remove(id);
  }
}
