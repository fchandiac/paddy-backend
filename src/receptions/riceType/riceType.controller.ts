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
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
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
  // --- AUDITORÍA DE CONSULTAS ---
  // Si quieres auditar solo las consultas hechas manualmente por el usuario (y no las automáticas de la UI),
  // usa el decorador @AuditUserQuery en vez de @Audit. Ejemplo:
  // @AuditUserQuery('VIEW', 'RICE_TYPE', 'Consulta de tipos de arroz por usuario')
  // El frontend debe enviar el header X-Request-Source: 'USER' para consultas manuales,
  // o 'UI_AUTO' para consultas automáticas (grillas, autocompletados, etc).
  // Si usas @Audit, todas las consultas serán auditadas sin distinción.
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
