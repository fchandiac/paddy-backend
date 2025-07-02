import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reception } from '../../../libs/entities/reception.entity';
import {
  CreateReceptionDto,
  UpdateReceptionDto,
} from '../../../libs/dto/reception.dto';
import { Producer } from '../../../libs/entities/producer.entity';
import { RiceType } from '../../../libs/entities/rice-type.entity';
import { Template } from '../../../libs/entities/template.entity';

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
      relations: ['producer', 'riceType'],
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

  async update(id: number, dto: UpdateReceptionDto): Promise<Reception> {
    const reception = await this.findOne(id);
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
  
}
