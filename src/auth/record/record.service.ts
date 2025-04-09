import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from '../../../libs/entities/record.entity';
import { Repository } from 'typeorm';
import { CreateRecordDto } from '../../../libs/dto/record.dto';
import { User } from '../../../libs/entities/user.entity';

export type RecordFlat = {
  id: number;
  userId: number | null;
  userName: string;
  identity: string;
  description: string;
  createdAt?: Date;
};


@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,
  ) {}

  async health(): Promise<string> {
    return 'RecordService is healthy ✅';
  }

  async createRecord(dto: CreateRecordDto): Promise<Record> {
    const user = await this.recordRepo.manager.findOne(User, {
      where: { id: dto.userId },
    });
  
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${dto.userId} no encontrado`);
    }
  
    const record = this.recordRepo.create({
      user, // ← relación asignada correctamente
      entity: dto.entity,
      description: dto.description,
    });
  
    return this.recordRepo.save(record);
  }

  async findAll(): Promise<RecordFlat[]> {
    const records = await this.recordRepo.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  
    return records.map((record) => ({
      id: record.id,
      userId: record.user?.id ?? null,
      userName: record.user?.name ?? '',
      identity: record.entity?? '',
      description: record.description,
      createdAt: record.createdAt,
    }));
  }

 
}
