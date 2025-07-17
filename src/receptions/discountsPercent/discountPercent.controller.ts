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
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { DiscountPercentService } from './discountPercent.service';
import {
  CreateDiscountPercentDto,
  UpdateDiscountPercentDto,
} from '../../../libs/dto/discount.dto';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity';

@Controller('discounts-percent')
@UseInterceptors(AuditInterceptor)
@UseGuards(JwtAuthGuard)
export class DiscountPercentController {
  constructor(
    private readonly discountPercentService: DiscountPercentService,
  ) {}

  @Get('health')
  @Audit('VIEW', 'DISCOUNT_PERCENT', 'Verificar salud del servicio de descuentos')
  async health() {
    return this.discountPercentService.health();
  }

  @Get()
  @Audit('VIEW', 'DISCOUNT_PERCENT', 'Listar todos los descuentos')
  async findAll(): Promise<DiscountPercent[]> {
    return this.discountPercentService.findAll();
  }

  @Get(':id')
  @Audit('VIEW', 'DISCOUNT_PERCENT', 'Buscar descuento por ID')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<DiscountPercent> {
    return this.discountPercentService.findById(id);
  }

  @Get('code/:code')
  @Audit('VIEW', 'DISCOUNT_PERCENT', 'Listar descuentos por código')
  async findAllByCode(
    @Param('code', ParseIntPipe) code: number,
  ): Promise<DiscountPercent[]> {
    return this.discountPercentService.findAllByCode(code);
  }

  @Post()
  @Audit('CREATE', 'DISCOUNT_PERCENT', 'Crear descuento')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() dto: CreateDiscountPercentDto & { userId?: number },
  ): Promise<DiscountPercent> {
    const { userId, ...discountData } = dto;
    return this.discountPercentService.create(discountData, userId);
  }

  @Put(':id')
  @Audit('UPDATE', 'DISCOUNT_PERCENT', 'Actualizar descuento')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountPercentDto & { userId?: number },
  ): Promise<DiscountPercent> {
    const { userId, ...discountData } = dto;
    return this.discountPercentService.update(id, discountData, userId);
  }

  @Delete(':id')
  @Audit('DELETE', 'DISCOUNT_PERCENT', 'Eliminar descuento')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() body?: { userId?: number },
  ): Promise<void> {
    const userId = body?.userId;
    return this.discountPercentService.remove(id, userId);
  }
}
