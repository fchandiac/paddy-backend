import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DiscountPercentService } from './discountPercent.service';
import {
  CreateDiscountPercentDto,
  UpdateDiscountPercentDto,
} from '../../../libs/dto/discount.dto';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity';

@Controller('discounts-percent')
export class DiscountPercentController {
  constructor(
    private readonly discountPercentService: DiscountPercentService,
  ) {}

  @Get('health')
  async health() {
    return this.discountPercentService.health();
  }

  @Get()
  async findAll(): Promise<DiscountPercent[]> {
    return this.discountPercentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<DiscountPercent> {
    return this.discountPercentService.findById(id);
  }

  @Get('code/:code')
  async findAllByCode(
    @Param('code', ParseIntPipe) code: number,
  ): Promise<DiscountPercent[]> {
    return this.discountPercentService.findAllByCode(code);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() dto: CreateDiscountPercentDto,
  ): Promise<DiscountPercent> {
    return this.discountPercentService.create(dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountPercentDto,
  ): Promise<DiscountPercent> {
    return this.discountPercentService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.discountPercentService.remove(id);
  }
}
