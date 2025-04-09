import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity';
import {
  CreateDiscountPercentDto,
  UpdateDiscountPercentDto,
} from '../../../libs/dto/discount.dto';

@Injectable()
export class DiscountPercentService {
  constructor(
    @InjectRepository(DiscountPercent)
    private readonly discountRepo: Repository<DiscountPercent>,
  ) {}

  async health(): Promise<string> {
    return 'DiscountPercentService is healthy ✅';
  }

  async findAll(): Promise<DiscountPercent[]> {
    return this.discountRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<DiscountPercent> {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Descuento con ID ${id} no encontrado.`);
    }
    return discount;
  }

  async findAllByCode(code: number): Promise<DiscountPercent[]> {
    return this.discountRepo.find({
      where: { discountCode: code },
      order: { start: 'ASC' },
    });
  }

  async create(dto: CreateDiscountPercentDto): Promise<DiscountPercent> {
    const duplicate = await this.discountRepo.findOne({
      where: {
        discountCode: dto.discountCode,
        start: dto.start,
        end: dto.end,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Ya existe un tramo de descuento con ese código y rango.`,
      );
    }

    const discount = this.discountRepo.create(dto);
    return this.discountRepo.save(discount);
  }

  async update(id: number, dto: UpdateDiscountPercentDto): Promise<DiscountPercent> {
    const discount = await this.findById(id);
    Object.assign(discount, dto);
    return this.discountRepo.save(discount);
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findById(id);
    await this.discountRepo.softRemove(discount);
  }
}
