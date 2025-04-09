import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producer } from '../../../libs/entities/producer.entity';
import {
  CreateProducerDto,
  UpdateProducerDto,
} from '../../../libs/dto/producer.dto';

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
  ) {}

  async health(): Promise<string> {
    return 'ProducerService is healthy ✅';
  }

  async findAll(): Promise<Producer[]> {
    return this.producerRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Producer> {
    const producer = await this.producerRepo.findOne({ where: { id } });
    if (!producer) {
      throw new NotFoundException(`Productor con ID ${id} no encontrado.`);
    }
    return producer;
  }

  async create(dto: CreateProducerDto): Promise<Producer> {
    const existing = await this.producerRepo.findOne({ where: { rut: dto.rut } });
    if (existing) {
      throw new ConflictException(`Ya existe un productor con el RUT ${dto.rut}.`);
    }

    const producer = this.producerRepo.create(dto);
    return this.producerRepo.save(producer);
  }

  async update(id: number, dto: UpdateProducerDto): Promise<Producer> {
    const producer = await this.findById(id);

    Object.assign(producer, dto);

    return this.producerRepo.save(producer);
  }

  async remove(id: number): Promise<void> {
    const producer = await this.findById(id);
    await this.producerRepo.softRemove(producer);
  }
}
