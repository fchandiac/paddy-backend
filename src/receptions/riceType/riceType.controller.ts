import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RiceTypeService } from './riceType.service';
import { CreateRiceTypeDto, UpdateRiceTypeDto } from '../../../libs/dto/rice-type.dto';
import { RiceType } from '../../../libs/entities/rice-type.entity';

@Controller('rice-types')
export class RiceTypeController {
  constructor(private readonly riceTypeService: RiceTypeService) {}

  @Get('health')
  async health(): Promise<string> {
    return this.riceTypeService.health();
  }

  @Get()
  async findAll(): Promise<RiceType[]> {
    return this.riceTypeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<RiceType> {
    return this.riceTypeService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateRiceTypeDto): Promise<RiceType> {
    return this.riceTypeService.create(dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRiceTypeDto,
  ): Promise<RiceType> {
    return this.riceTypeService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.riceTypeService.remove(id);
  }
}
