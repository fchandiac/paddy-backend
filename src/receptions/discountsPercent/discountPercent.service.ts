import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity';
import {
  CreateDiscountPercentDto,
  UpdateDiscountPercentDto,
} from '../../../libs/dto/discount.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class DiscountPercentService {
  constructor(
    @InjectRepository(DiscountPercent)
    private readonly discountRepo: Repository<DiscountPercent>,
    private readonly auditService: AuditService,
  ) {}

  async health(): Promise<string> {
    return 'DiscountPercentService is healthy ✅';
  }

  async findAll(): Promise<DiscountPercent[]> {
    return this.discountRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<DiscountPercent> {
    const { translate } = require('../../../libs/utils/i18n');
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(translate('Descuento con ID no encontrado', 'es') + ` (Discount with ID ${id} not found)`);
    }
    return discount;
  }

  async findAllByCode(code: number): Promise<DiscountPercent[]> {
    // Validación de código (ejemplo: debe ser positivo y menor a 10000)
    if (typeof code !== 'number' || isNaN(code) || code <= 0 || code > 10000) {
      throw new BadRequestException('Código de descuento inválido');
    }
    return this.discountRepo.find({
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
    const qb = this.discountRepo
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
  

  async create(dto: CreateDiscountPercentDto, userId?: number): Promise<DiscountPercent> {
    // Validación lógica: start <= end
    if (dto.start > dto.end) {
      throw new BadRequestException('El inicio del rango no puede ser mayor que el final');
    }
    // Primero: validar duplicado exacto
    const { translate } = require('../../../libs/utils/i18n');
    const duplicate = await this.discountRepo.findOne({
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
      const discount = this.discountRepo.create(dto);
      const savedDiscount = await this.discountRepo.save(discount);
      // Registrar auditoría
      try {
        await this.auditService.createAuditLog({
          userId,
          action: 'CREATE',
          entityType: 'DISCOUNT_PERCENT',
          entityId: savedDiscount.id,
          description: `Rango de descuento creado: Código ${savedDiscount.discountCode}, ${savedDiscount.start}%-${savedDiscount.end}%, Descuento ${savedDiscount.percent}%`,
          newValues: savedDiscount,
          success: true,
        });
      } catch (auditErr) {
        throw new InternalServerErrorException('Fallo al registrar auditoría');
      }
      return savedDiscount;
    } catch (err) {
      throw new InternalServerErrorException('Error al guardar el descuento');
    }
  }

  async update(
    id: number,
    dto: UpdateDiscountPercentDto,
    userId?: number,
  ): Promise<DiscountPercent> {
    // 1) Obtengo el registro actual
    const discount = await this.findById(id);
    const oldValues = { ...discount };
    // 2) Determino los valores finales a validar
    const code  = dto.discountCode ?? discount.discountCode;
    const start = dto.start        ?? discount.start;
    const end   = dto.end          ?? discount.end;
    // Validación lógica: start <= end
    if (start > end) {
      throw new BadRequestException('El inicio del rango no puede ser mayor que el final');
    }
    // 3) Compruebo solapamientos excluyendo este ID
    await this.ensureNoOverlap(code, start, end, id);
    // 4) (Opcional) Evitar duplicados exactos si cambió el triplete
    const { translate } = require('../../../libs/utils/i18n');
    if (
      code  !== discount.discountCode ||
      start !== discount.start        ||
      end   !== discount.end
    ) {
      const duplicate = await this.discountRepo.findOne({
        where: { discountCode: code, start, end },
      });
      if (duplicate) {
        throw new ConflictException(
          translate('Ya existe un tramo de descuento con ese código y rango', 'es')
        );
      }
    }
    try {
      // 5) Asigno los cambios y guardo
      Object.assign(discount, dto);
      const savedDiscount = await this.discountRepo.save(discount);
      // Registrar auditoría
      try {
        await this.auditService.createAuditLog({
          userId,
          action: 'UPDATE',
          entityType: 'DISCOUNT_PERCENT',
          entityId: savedDiscount.id,
          description: `Rango de descuento actualizado: Código ${savedDiscount.discountCode}, ${savedDiscount.start}%-${savedDiscount.end}%, Descuento ${savedDiscount.percent}%`,
          oldValues,
          newValues: savedDiscount,
          success: true,
        });
      } catch (auditErr) {
        throw new InternalServerErrorException('Fallo al registrar auditoría');
      }
      return savedDiscount;
    } catch (err) {
      throw new InternalServerErrorException('Error al actualizar el descuento');
    }
  }
  

  async remove(id: number, userId?: number): Promise<void> {
    // Si ya fue eliminado, findById lanzará NotFoundException
    const discount = await this.findById(id);
    // Registrar auditoría antes de eliminar
    try {
      await this.auditService.createAuditLog({
        userId,
        action: 'DELETE',
        entityType: 'DISCOUNT_PERCENT',
        entityId: discount.id,
        description: `Rango de descuento eliminado: Código ${discount.discountCode}, ${discount.start}%-${discount.end}%, Descuento ${discount.percent}%`,
        oldValues: discount,
        success: true,
      });
    } catch (auditErr) {
      throw new InternalServerErrorException('Fallo al registrar auditoría');
    }
    try {
      await this.discountRepo.softRemove(discount);
    } catch (err) {
      throw new InternalServerErrorException('Error al eliminar el descuento');
    }
  }
}
