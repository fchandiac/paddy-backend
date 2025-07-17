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
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProducerService } from './producer.service';
import {
  AddBankAccountDto,
  CreateProducerDto,
  CreateProducerWithBankDto,
  UpdateProducerDto,
} from '../../../libs/dto/producer.dto';
import { Producer } from '../../../libs/entities/producer.entity';

@Controller('producers')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get('health')
  @Audit('VIEW', 'PRODUCER', 'Verificar salud del servicio de productores')
  async health(): Promise<string> {
    return this.producerService.health();
  }

  @Get()
  @Audit('VIEW', 'PRODUCER', 'Listar todos los productores')
  async findAll(): Promise<Producer[]> {
    return this.producerService.findAll();
  }

  @Get(':id')
  @Audit('VIEW', 'PRODUCER', 'Buscar productor por ID')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Producer> {
    return this.producerService.findById(id);
  }

  @Post()
  @Audit('CREATE', 'PRODUCER', 'Crear productor')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateProducerDto): Promise<Producer> {
    return this.producerService.create(dto);
  }

  @Post('with-bank')
  @Audit('CREATE', 'PRODUCER', 'Crear productor con cuenta bancaria')
  async createWithBankAccount(
    @Body() dto: CreateProducerWithBankDto,
  ): Promise<Producer> {
    return this.producerService.createWithBankAccount(dto);
  }

  @Patch(':id/add-bank-account')
  @Audit('UPDATE', 'PRODUCER', 'Agregar cuenta bancaria a productor')
  async addBankAccount(
    @Param('id') producerId: number,
    @Body() dto: AddBankAccountDto,
  ): Promise<Producer> {
    return this.producerService.addBankAccount(producerId, dto);
  }

  @Put(':id')
  @Audit('UPDATE', 'PRODUCER', 'Actualizar productor')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProducerDto,
  ): Promise<Producer> {
    return this.producerService.update(id, dto);
  }

  @Delete(':id')
  @Audit('DELETE', 'PRODUCER', 'Eliminar productor')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.producerService.remove(id);
  }
}
