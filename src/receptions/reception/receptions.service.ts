import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reception } from '../../../libs/entities/reception.entity';
import {
  CreateReceptionDto,
  UpdateReceptionDto,
  UpdateReasonDto,
} from '../../../libs/dto/reception.dto';
import { Producer } from '../../../libs/entities/producer.entity';
import { RiceType } from '../../../libs/entities/rice-type.entity';
import { Template } from '../../../libs/entities/template.entity';
import { User } from '../../../libs/entities/user.entity';
import { ReceptionHistoryEntry } from '../../../libs/interfaces/reception-history.interface';
import { AuditService } from '../../audit/audit.service';
import { Season } from '../../../libs/entities/season.entity';

@Injectable()
export class ReceptionService {
  constructor(
    @InjectRepository(Reception)
    private readonly receptionRepo: Repository<Reception>,

    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,

    @InjectRepository(RiceType)
    private readonly riceTypeRepo: Repository<RiceType>,

    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,

    private readonly auditService: AuditService,
  ) {}

  async health(): Promise<string> {
    return 'Reception service is running';
  }

  async create(dto: CreateReceptionDto, userId?: number): Promise<Reception> {
    const finalUserId = userId;
    
    try {
      const producer = await this.producerRepo.findOne({
        where: { id: dto.producerId },
      });
      if (!producer) {
        throw new NotFoundException('Productor no encontrado');
      }
    
      const riceType = await this.riceTypeRepo.findOne({
        where: { id: dto.riceTypeId },
      });
      if (!riceType) {
        throw new NotFoundException('Tipo de arroz no encontrado');
      }
    
      let template = null;
      if (dto.templateId) {
        template = await this.templateRepo.findOne({
          where: { id: dto.templateId },
        });
        if (!template) {
          throw new NotFoundException('Plantilla no encontrada');
        }
      }
    
      const {
        templateId, // extraemos y descartamos para no pasarlo directo
        ...rest
      } = dto;
    
      // Cargar entidad User si userId válido
      // Cargar entidad User según userId
      let userEntity = null;
      if (finalUserId) {
        userEntity = await this.userRepo.findOne({ where: { id: finalUserId } });
      }
      const newReception = this.receptionRepo.create({
        ...rest,
        producer,
        riceType,
        template: template || null,
        user: userEntity || null,
        userId: userEntity ? userEntity.id : null,
      });

      const savedReception = await this.receptionRepo.save(newReception);

      // Auditoría: registrar creación exitosa
      await this.auditService.createAuditLog({
        userId: finalUserId,
        action: 'CREATE',
        entityType: 'RECEPTION',
        entityId: savedReception.id,
        description: `Recepción creada para productor ${producer.name}`,
        newValues: {
          id: savedReception.id,
          producerId: dto.producerId,
          riceTypeId: dto.riceTypeId,
          guide: dto.guide,
          licensePlate: dto.licensePlate,
          grossWeight: dto.grossWeight,
          netWeight: dto.netWeight,
        },
        success: true,
      });

      return savedReception;
    } catch (error) {
      // Auditoría: registrar error
      await this.auditService.createAuditLog({
        userId: finalUserId,
        action: 'CREATE',
        entityType: 'RECEPTION',
        description: `Error al crear recepción: ${error.message}`,
        newValues: dto,
        success: false,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  async findAll(): Promise<Reception[]> {
    return await this.receptionRepo.find({
      relations: ['producer', 'riceType', 'template'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Reception> {
    const reception = await this.receptionRepo.findOne({
      where: { id },
      relations: ['producer', 'riceType', 'template'],
      order: { createdAt: 'DESC' },
    });

    if (!reception) {
      throw new NotFoundException(`Recepción con ID ${id} no encontrada`);
    }

    return reception;
  }

  async update(id: number, dto: UpdateReceptionDto, updateReason?: UpdateReasonDto, userId?: number): Promise<Reception> {
    try {
      const reception = await this.findOne(id);
      
      // Guardar valores anteriores para auditoría
      const oldValues = {
        price: reception.price,
        grossWeight: reception.grossWeight,
        tare: reception.tare,
        netWeight: reception.netWeight,
        percentHumedad: reception.percentHumedad,
        toleranceHumedad: reception.toleranceHumedad,
        percentGranosVerdes: reception.percentGranosVerdes,
        toleranceGranosVerdes: reception.toleranceGranosVerdes,
        percentImpurezas: reception.percentImpurezas,
        toleranceImpurezas: reception.toleranceImpurezas,
        percentGranosManchados: reception.percentGranosManchados,
        toleranceGranosManchados: reception.toleranceGranosManchados,
        percentHualcacho: reception.percentHualcacho,
        toleranceHualcacho: reception.toleranceHualcacho,
        percentGranosPelados: reception.percentGranosPelados,
        toleranceGranosPelados: reception.toleranceGranosPelados,
        percentGranosYesosos: reception.percentGranosYesosos,
        toleranceGranosYesosos: reception.toleranceGranosYesosos,
        percentVano: reception.percentVano,
        toleranceVano: reception.toleranceVano,
        toleranceBonificacion: reception.toleranceBonificacion,
        percentSecado: reception.percentSecado,
        totalDiscount: reception.totalDiscount,
        bonus: reception.bonus,
        paddyNet: reception.paddyNet,
        status: reception.status,
        note: reception.note,
      };
      
      // Crear entrada del historial antes de actualizar
      const historyEntry: ReceptionHistoryEntry = {
        timestamp: new Date().toISOString(),
        ...oldValues,
        changedBy: updateReason?.changedBy || 'system',
        reason: updateReason?.reason || 'Actualización de recepción',
      };
      
      // Inicializar historyLog si es null
      if (!reception.historyLog) {
        reception.historyLog = [];
      }
      
      // Agregar la entrada al historial
      reception.historyLog.push(historyEntry);
      
      // Aplicar los cambios del DTO
      Object.assign(reception, dto);
      
      const updatedReception = await this.receptionRepo.save(reception);

      // Auditoría: registrar actualización exitosa
      await this.auditService.createAuditLog({
        userId,
        action: 'UPDATE',
        entityType: 'RECEPTION',
        entityId: id,
        description: `Recepción actualizada: ${updateReason?.reason || 'Actualización de parámetros'}`,
        oldValues,
        newValues: dto,
        metadata: {
          changedBy: updateReason?.changedBy,
          reason: updateReason?.reason,
        },
        success: true,
      });

      return updatedReception;
    } catch (error) {
      // Auditoría: registrar error
      await this.auditService.createAuditLog({
        userId,
        action: 'UPDATE',
        entityType: 'RECEPTION',
        entityId: id,
        description: `Error al actualizar recepción: ${error.message}`,
        newValues: dto,
        success: false,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  async remove(id: number, userId?: number): Promise<void> {
    try {
      const reception = await this.findOne(id);
      await this.receptionRepo.remove(reception);

      // Auditoría: registrar eliminación exitosa
      await this.auditService.createAuditLog({
        userId,
        action: 'DELETE',
        entityType: 'RECEPTION',
        entityId: id,
        description: `Recepción eliminada: ${reception.guide}`,
        oldValues: {
          id: reception.id,
          guide: reception.guide,
          producerId: reception.producerId,
          riceTypeId: reception.riceTypeId,
        },
        success: true,
      });
    } catch (error) {
      // Auditoría: registrar error
      await this.auditService.createAuditLog({
        userId,
        action: 'DELETE',
        entityType: 'RECEPTION',
        entityId: id,
        description: `Error al eliminar recepción: ${error.message}`,
        success: false,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  async findAllByProducer(producerId: number): Promise<Reception[]> {
    return await this.receptionRepo.find({
      where: { producerId },
      relations: ['riceType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPendingByProducer(producerId: number): Promise<Reception[]> {
    return await this.receptionRepo.find({
      where: { producerId, status: 'pending' },
      relations: ['riceType'],
      order: { createdAt: 'DESC' },
    });
  }
  
  async getReceptionHistory(id: number): Promise<any> {
    const reception = await this.findOne(id);
    
    // Si no hay historial, devolver un array vacío
    if (!reception.historyLog || reception.historyLog.length === 0) {
      return { 
        id: reception.id,
        currentData: {
          price: reception.price,
          grossWeight: reception.grossWeight,
          tare: reception.tare,
          netWeight: reception.netWeight,
          percentHumedad: reception.percentHumedad,
          toleranceHumedad: reception.toleranceHumedad,
          percentGranosVerdes: reception.percentGranosVerdes,
          toleranceGranosVerdes: reception.toleranceGranosVerdes,
          percentImpurezas: reception.percentImpurezas,
          toleranceImpurezas: reception.toleranceImpurezas,
          percentGranosManchados: reception.percentGranosManchados,
          toleranceGranosManchados: reception.toleranceGranosManchados,
          percentHualcacho: reception.percentHualcacho,
          toleranceHualcacho: reception.toleranceHualcacho,
          percentGranosPelados: reception.percentGranosPelados,
          toleranceGranosPelados: reception.toleranceGranosPelados,
          percentGranosYesosos: reception.percentGranosYesosos,
          toleranceGranosYesosos: reception.toleranceGranosYesosos,
          percentVano: reception.percentVano,
          toleranceVano: reception.toleranceVano,
          toleranceBonificacion: reception.toleranceBonificacion,
          percentSecado: reception.percentSecado,
          totalDiscount: reception.totalDiscount,
          bonus: reception.bonus,
          paddyNet: reception.paddyNet,
          status: reception.status,
          note: reception.note
        },
        history: []
      };
    }
    
    return { 
      id: reception.id,
      currentData: {
        price: reception.price,
        grossWeight: reception.grossWeight,
        tare: reception.tare,
        netWeight: reception.netWeight,
        percentHumedad: reception.percentHumedad,
        toleranceHumedad: reception.toleranceHumedad,
        percentGranosVerdes: reception.percentGranosVerdes,
        toleranceGranosVerdes: reception.toleranceGranosVerdes,
        percentImpurezas: reception.percentImpurezas,
        toleranceImpurezas: reception.toleranceImpurezas,
        percentGranosManchados: reception.percentGranosManchados,
        toleranceGranosManchados: reception.toleranceGranosManchados,
        percentHualcacho: reception.percentHualcacho,
        toleranceHualcacho: reception.toleranceHualcacho,
        percentGranosPelados: reception.percentGranosPelados,
        toleranceGranosPelados: reception.toleranceGranosPelados,
        percentGranosYesosos: reception.percentGranosYesosos,
        toleranceGranosYesosos: reception.toleranceGranosYesosos,
        percentVano: reception.percentVano,
        toleranceVano: reception.toleranceVano,
        toleranceBonificacion: reception.toleranceBonificacion,
        percentSecado: reception.percentSecado,
        totalDiscount: reception.totalDiscount,
        bonus: reception.bonus,
        paddyNet: reception.paddyNet,
        status: reception.status,
        note: reception.note
      },
      history: reception.historyLog
    };
  }
}