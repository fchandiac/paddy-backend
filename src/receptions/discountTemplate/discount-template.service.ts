import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountTemplate } from 'libs/entities/discount-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountTemplateService {
  constructor(
    @InjectRepository(DiscountTemplate)
    private readonly discountTemplateRepo: Repository<DiscountTemplate>,
  ) {}

  async findAll(): Promise<DiscountTemplate[]> {
    return this.discountTemplateRepo.find();
  }

  async findOne(id: number): Promise<DiscountTemplate> {
    const template = await this.discountTemplateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(data: Partial<DiscountTemplate>): Promise<DiscountTemplate> {
    const newTemplate = this.discountTemplateRepo.create(data);
    return this.discountTemplateRepo.save(newTemplate);
  }

  async update(id: number, data: Partial<DiscountTemplate>): Promise<DiscountTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, data);
    return this.discountTemplateRepo.save(template);
  }

  async delete(id: number): Promise<void> {
    await this.discountTemplateRepo.softDelete(id);
  }
}
