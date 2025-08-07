import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { AnalysisParamService } from './analysis-param.service';
import {
  CreateAnalysisParamDto,
  UpdateAnalysisParamDto,
} from '../../../libs/dto/analysis-param.dto';
import { AnalysisParam } from '../../../libs/entities/analysis-param.entity';

@Controller('analysis-param')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class AnalysisParamController {
  constructor(
    private readonly analysisParamService: AnalysisParamService,
  ) {}

  @Get('health')
  @Audit('VIEW', 'ANALYSIS_PARAM', 'Verificar salud del servicio de parámetros de análisis')
  async health() {
    return this.analysisParamService.health();
  }

  @Get()
  // --- AUDITORÍA DE CONSULTAS ---
  // Si quieres auditar solo las consultas hechas manualmente por el usuario (y no las automáticas de la UI),
  // usa el decorador @AuditUserQuery en vez de @Audit. Ejemplo:
  // @AuditUserQuery('VIEW', 'DISCOUNT_PERCENT', 'Consulta de descuentos por usuario')
  // El frontend debe enviar el header X-Request-Source: 'USER' para consultas manuales,
  // o 'UI_AUTO' para consultas automáticas (grillas, autocompletados, etc).
  // Si usas @Audit, todas las consultas serán auditadas sin distinción.
  @Audit('VIEW', 'ANALYSIS_PARAM', 'Listar todos los parámetros de análisis')
  async findAll(): Promise<AnalysisParam[]> {
    return this.analysisParamService.findAll();
  }

  @Get(':id')
  @Audit('VIEW', 'DISCOUNT_PERCENT', 'Buscar descuento por ID')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<AnalysisParam> {
    return this.analysisParamService.findById(id);
  }

  @Get('code/:code')
  @Audit('VIEW', 'ANALYSIS_PARAM', 'Listar parámetros de análisis por código')
  async findAllByCode(
    @Param('code', ParseIntPipe) code: number,
  ): Promise<AnalysisParam[]> {
    return this.analysisParamService.findAllByCode(code);
  }

  @Post()
  @Audit('CREATE', 'ANALYSIS_PARAM', 'Crear parámetro de análisis')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() dto: CreateAnalysisParamDto & { userId?: number },
  ): Promise<AnalysisParam> {
    const { userId, ...analysisData } = dto;
    return this.analysisParamService.create(analysisData, userId);
  }

  @Put(':id')
  @Audit('UPDATE', 'ANALYSIS_PARAM', 'Actualizar parámetro de análisis')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnalysisParamDto & { userId?: number },
  ): Promise<AnalysisParam> {
    const { userId, ...analysisData } = dto;
    return this.analysisParamService.update(id, analysisData, userId);
  }

  @Delete(':id')
  @Audit('DELETE', 'ANALYSIS_PARAM', 'Eliminar parámetro de análisis')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() body?: { userId?: number },
  ): Promise<void> {
    const userId = body?.userId;
    return this.analysisParamService.remove(id, userId);
  }
}
