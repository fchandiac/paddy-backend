import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisParam } from '../../../libs/entities/analysis-param.entity';
import {
  CreateAnalysisParamDto,
  UpdateAnalysisParamDto,
} from '../../../libs/dto/analysis-param.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AnalysisParamService {
  constructor(
    @InjectRepository(AnalysisParam)
    private readonly analysisRepo: Repository<AnalysisParam>,
    private readonly auditService: AuditService,
  ) {}

  async health(): Promise<string> {
    return 'AnalysisParamService is healthy ✅';
  }

  async findAll(): Promise<AnalysisParam[]> {
    return this.analysisRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<AnalysisParam> {
    const { translate } = require('../../../libs/utils/i18n');
    const analysis = await this.analysisRepo.findOne({ where: { id } });
    if (!analysis) {
      throw new NotFoundException(
        translate('Parámetro con ID no encontrado', 'es') + ` (AnalysisParam with ID ${id} not found)`
      );
    }
    return analysis;
  }

  async findAllByCode(code: number): Promise<AnalysisParam[]> {
    // Validación de código (ejemplo: debe ser positivo y menor a 10000)
    if (typeof code !== 'number' || isNaN(code) || code <= 0 || code > 10000) {
      throw new BadRequestException('Código de descuento inválido');
    }
    return this.analysisRepo.find({
      where: { discountCode: code },
      order: { start: 'ASC' },
    });
  }

  /** Comprueba si el rango [start, end] se solapa con otro existente */
  private async ensureNoOverlap(
    code: number,
    start: number,
    end: number,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.analysisRepo
      .createQueryBuilder('dp')
      .where('dp.discountCode = :code', { code })
      .andWhere('dp.start <= :end AND dp.end >= :start', { start, end });

    if (excludeId) {
      qb.andWhere('dp.id != :excludeId', { excludeId });
    }

    const { translate } = require('../../../libs/utils/i18n');
    const overlapping = await qb.getOne();
    if (overlapping) {
      throw new ConflictException(
        translate('El rango se solapa con otro existente', 'es'),
      );
    }
  }
  

  async create(dto: CreateAnalysisParamDto, userId?: number): Promise<AnalysisParam> {
    // Validación lógica: start <= end
    if (dto.start > dto.end) {
      throw new BadRequestException('El inicio del rango no puede ser mayor que el final');
    }
    // Validación lógica: percent <= 100
    if (dto.percent > 100) {
      const { translate } = require('../../../libs/utils/i18n');
      throw new BadRequestException(translate('El porcentaje no puede ser mayor que 100', 'es'));
    }
    // Primero: validar duplicado exacto
    const { translate } = require('../../../libs/utils/i18n');
    const duplicate = await this.analysisRepo.findOne({
      where: {
        discountCode: dto.discountCode,
        start: dto.start,
        end: dto.end,
      },
    });
    if (duplicate) {
      throw new ConflictException(
        translate('Ya existe un tramo de descuento con ese código y rango', 'es'),
      );
    }
    // Luego: validar solapamiento con otros rangos
    await this.ensureNoOverlap(dto.discountCode, dto.start, dto.end);
    try {
      const analysis = this.analysisRepo.create(dto);
      const savedAnalysis = await this.analysisRepo.save(analysis);
      // Registrar auditoría
      try {
        await this.auditService.createAuditLog({
          userId,
          action: 'CREATE',
          entityType: 'ANALYSIS_PARAM',
          entityId: savedAnalysis.id,
          description: `Parámetro de análisis creado: Código ${savedAnalysis.discountCode}, Rango ${savedAnalysis.start}-${savedAnalysis.end}, Valor ${savedAnalysis.percent}`,
          newValues: savedAnalysis,
          success: true,
        });
      } catch (auditErr) {
        throw new InternalServerErrorException('Fallo al registrar auditoría');
      }
      return savedAnalysis;
    } catch (err) {
      throw new InternalServerErrorException('Error al guardar el descuento');
    }
  }

  async update(
    id: number,
    dto: UpdateAnalysisParamDto,
    userId?: number,
  ): Promise<AnalysisParam> {
    const analysis = await this.findById(id);
    const oldValues = { ...analysis };
    const code = dto.discountCode ?? analysis.discountCode;
    const start = dto.start ?? analysis.start;
    const end = dto.end ?? analysis.end;
    if (start > end) {
      throw new BadRequestException('El inicio no puede ser mayor que el fin');
    }
    if ((dto.percent ?? analysis.percent) > 100) {
      const { translate } = require('../../../libs/utils/i18n');
      throw new BadRequestException(
        translate('El valor no puede ser mayor que 100', 'es'),
      );
    }
    await this.ensureNoOverlap(code, start, end, id);
    const duplicate = await this.analysisRepo.findOne({ where: { discountCode: code, start, end } });
    if (duplicate && duplicate.id !== id) {
      const { translate } = require('../../../libs/utils/i18n');
      throw new ConflictException(
        translate('Ya existe un parámetro con ese código y rango', 'es'),
      );
    }
    Object.assign(analysis, dto);
    const savedAnalysis = await this.analysisRepo.save(analysis);
    await this.auditService.createAuditLog({
      userId,
      action: 'UPDATE',
      entityType: 'ANALYSIS_PARAM',
      entityId: savedAnalysis.id,
      description: `Parámetro actualizado: Código ${savedAnalysis.discountCode}, Rango ${savedAnalysis.start}-${savedAnalysis.end}, Valor ${savedAnalysis.percent}`,
      oldValues,
      newValues: savedAnalysis,
      success: true,
    });
    return savedAnalysis;
  }
  

  async remove(id: number, userId?: number): Promise<void> {
    const analysis = await this.findById(id);
    await this.auditService.createAuditLog({
      userId,
      action: 'DELETE',
      entityType: 'ANALYSIS_PARAM',
      entityId: analysis.id,
      description: `Parámetro eliminado: Código ${analysis.discountCode}, Rango ${analysis.start}-${analysis.end}, Valor ${analysis.percent}`,
      oldValues: analysis,
      success: true,
    });
    await this.analysisRepo.softDelete(id);
  }
}
