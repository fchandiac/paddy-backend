import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RiceType } from '../../../libs/entities/rice-type.entity';
import { Repository } from 'typeorm';
import {
  CreateRiceTypeDto,
  UpdateRiceTypeDto,
} from '../../../libs/dto/rice-type.dto';

@Injectable()
export class RiceTypeService {
  constructor(
    @InjectRepository(RiceType)
    private readonly riceTypeRepo: Repository<RiceType>,
  ) {}

  async health(): Promise<string> {
    return 'RiceTypeService is healthy ✅';
  }

  async findAll(): Promise<RiceType[]> {
    return this.riceTypeRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<RiceType> {
    const riceType = await this.riceTypeRepo.findOne({ where: { id } });
    if (!riceType) {
      throw new NotFoundException(`Tipo de arroz con ID ${id} no encontrado.`);
    }
    return riceType;
  }

  async create(dto: CreateRiceTypeDto): Promise<RiceType> {
    // Validar nombre único
    const existingByName = await this.riceTypeRepo.findOne({
      where: { name: dto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Ya existe un tipo de arroz con el nombre "${dto.name}".`,
      );
    }

    // Validar código único
    const existingByCode = await this.riceTypeRepo.findOne({
      where: { code: dto.code },
    });

    if (existingByCode) {
      throw new ConflictException(
        `Ya existe un tipo de arroz con el código "${dto.code}".`,
      );
    }

    const riceType = this.riceTypeRepo.create(dto);
    return this.riceTypeRepo.save(riceType);
  }

  async update(id: number, dto: UpdateRiceTypeDto): Promise<RiceType> {
    const riceType = await this.findById(id);

    // Si se está actualizando el nombre, validar que no exista otro con ese nombre
    if (dto.name && dto.name !== riceType.name) {
      const existingByName = await this.riceTypeRepo.findOne({
        where: { name: dto.name },
      });

      if (existingByName) {
        throw new ConflictException(
          `Ya existe un tipo de arroz con el nombre "${dto.name}".`,
        );
      }
    }

    // Si se está actualizando el código, validar que no exista otro con ese código
    if (dto.code && dto.code !== riceType.code) {
      const existingByCode = await this.riceTypeRepo.findOne({
        where: { code: dto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          `Ya existe un tipo de arroz con el código "${dto.code}".`,
        );
      }
    }

    Object.assign(riceType, dto);

    return this.riceTypeRepo.save(riceType);
  }

  async remove(id: number): Promise<void> {
    const riceType = await this.findById(id);
    await this.riceTypeRepo.softRemove(riceType);
  }
}
