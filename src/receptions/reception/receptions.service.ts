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
import { ReceptionHistoryEntry } from '../../../libs/interfaces/reception-history.interface';

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


  ) {}

  async health(): Promise<string> {
    return 'Reception service is running';
  }

  async create(dto: CreateReceptionDto): Promise<Reception> {
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
  
    const newReception = this.receptionRepo.create({
      ...rest,
      producer,
      riceType,
      template: template || null,
    });

  
    return await this.receptionRepo.save(newReception);
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

  async update(id: number, dto: UpdateReceptionDto, updateReason?: UpdateReasonDto): Promise<Reception> {
    const reception = await this.findOne(id);
    
    // Crear entrada del historial antes de actualizar
    const historyEntry: ReceptionHistoryEntry = {
      timestamp: new Date().toISOString(),
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
    
    return await this.receptionRepo.save(reception);
  }

  async remove(id: number): Promise<void> {
    const reception = await this.findOne(id);
    await this.receptionRepo.remove(reception);
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
