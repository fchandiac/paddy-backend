import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from 'libs/entities/template.entity';
import { CreateTemplateDto } from 'libs/dto/template.dto';
import { Producer } from 'libs/entities/producer.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,

    @InjectRepository(Producer)
    private readonly producerRepository: Repository<Producer>,
  ) {}

  async create(dto: CreateTemplateDto): Promise<Template> {
    let producer: Producer | null = null;

    if (dto.producerId) {
      producer = await this.producerRepository.findOne({
        where: { id: dto.producerId },
      });
    }

    const template = this.templateRepository.create({
      ...dto,
      producer: producer ?? null,
    });

    try {
      return await this.templateRepository.save(template);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe una plantilla con ese nombre');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    const result = await this.templateRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada.`);
    }
  }

  async findAll(): Promise<Template[]> {
    return await this.templateRepository.find({
      relations: ['producer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByProducer(producerId: number): Promise<Template[]> {
    const producer = await this.producerRepository.findOne({
      where: { id: producerId },
    });

    if (!producer) {
      throw new NotFoundException(
        `No se encontró el productor con ID ${producerId}`,
      );
    }

    return await this.templateRepository.find({
      where: { producer: { id: producerId } },
      relations: ['producer'],
      order: { createdAt: 'DESC' },
    });
  }

  async setDefault(id: number): Promise<Template> {
    // 1. Buscar todas las plantillas que actualmente están marcadas como default
    const currentDefaults = await this.templateRepository.find({
      where: {
        default: true,
      },     
    });

    // 2. Desactivarlas
    for (const template of currentDefaults) {
      await this.templateRepository.update(template.id, {
        default: false,
      });
    }

    // 3. Marcar la nueva como default
    await this.templateRepository.update(id, { default: true });

    // 4. Retornar actualizada
    return this.templateRepository.findOne({ where: { id } });
  }

  async getDefaultTemplate(): Promise<Template | null> {
    return this.templateRepository.findOne({
      where: { default: true },
      relations: ['producer'],
    });
  }
  
  async findById(id: number): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['producer'],
    });
  
    if (!template) {
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada.`);
    }
  
    return template;
  }
}
