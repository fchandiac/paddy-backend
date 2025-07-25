import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { RiceTypeService } from './riceType.service';
import { CreateRiceTypeDto, UpdateRiceTypeDto } from '../../../libs/dto/rice-type.dto';
import { RiceType } from '../../../libs/entities/rice-type.entity';
import { AuditInterceptor, Audit, AuditUserQuery } from '../../common/interceptors/audit.interceptor';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';

@Controller('rice-types')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class RiceTypeController {
  constructor(private readonly riceTypeService: RiceTypeService) {}

  @Get('health')
  async health(): Promise<string> {
    return this.riceTypeService.health();
  }

  @Get()
  @AuditUserQuery('VIEW', 'RICE_TYPE', 'Consulta de tipos de arroz por usuario')
  async findAll(): Promise<RiceType[]> {
    return this.riceTypeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<RiceType> {
    return this.riceTypeService.findById(id);
  }

  @Post()
  @Audit('CREATE', 'RICE_TYPE', 'Crear tipo de arroz')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateRiceTypeDto): Promise<RiceType> {
    return this.riceTypeService.create(dto);
  }

  @Put(':id')
  @Audit('UPDATE', 'RICE_TYPE', 'Actualizar tipo de arroz')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRiceTypeDto,
  ): Promise<RiceType> {
    return this.riceTypeService.update(id, dto);
  }

  @Delete(':id')
  @Audit('DELETE', 'RICE_TYPE', 'Eliminar tipo de arroz')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.riceTypeService.remove(id);
  }
}
