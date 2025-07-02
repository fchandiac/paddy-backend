import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'libs/dto/template.dto';
import { Template } from 'libs/entities/template.entity';

@Controller('template')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateTemplateDto,
  ): Promise<Template> {
    return await this.templateService.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.templateService.delete(id);
  }

  @Get()
  async findAll(): Promise<Template[]> {
    return await this.templateService.findAll();
  }

   // Obtener plantilla por ID
   @Get('find-by-id/:id')
   async findById(@Param('id', ParseIntPipe) id: number) {
     return this.templateService.findById(id);
   }

  @Get('by-producer/:id')
  async findAllByProducer(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Template[]> {
    return await this.templateService.findAllByProducer(id);
  }


  @Patch('set-default/:id')
  async setDefault(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Template> {
    return await this.templateService.setDefault(id);
  }

  @Get('default')
  async getDefault() {
    const result = await this.templateService.getDefaultTemplate();
    if (!result) {
      throw new NotFoundException('No hay plantilla predeterminada configurada');
    }
    return result;
  }
}


