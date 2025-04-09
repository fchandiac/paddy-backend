import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { DiscountTemplateService } from './discount-template.service';
import { DiscountTemplate } from 'libs/entities/discount-template.entity';

@Controller('discount-templates')
export class DiscountTemplateController {
  constructor(private readonly service: DiscountTemplateService) {}

  @Get()
  findAll(): Promise<DiscountTemplate[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DiscountTemplate> {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Partial<DiscountTemplate>): Promise<DiscountTemplate> {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<DiscountTemplate>): Promise<DiscountTemplate> {
    return this.service.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(Number(id));
  }
}
