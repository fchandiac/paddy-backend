import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ReceptionService } from './receptions.service';
import { CreateReceptionDto, UpdateReceptionDto } from '../../../libs/dto/reception.dto';

@Controller('receptions')
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  // 🧪 Healthcheck
  @Get('health')
  health() {
    return 'Reception service is running';
  }

  // 📥 Crear una recepción
  @Post()
  create(@Body() dto: CreateReceptionDto) {
    return this.receptionService.create(dto);
  }

  // 📄 Listar todas las recepciones
  @Get()
  findAll() {
    return this.receptionService.findAll();
  }

  // 📄 Buscar por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receptionService.findOne(id);
  }

  // ✏️ Actualizar por ID
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReceptionDto,
  ) {
    return this.receptionService.update(id, dto);
  }

  // ❌ Eliminar por ID
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.receptionService.remove(id);
  }

  // 📄 Recepciones por productor
  @Get('producer/:producerId')
  findAllByProducer(@Param('producerId', ParseIntPipe) producerId: number) {
    return this.receptionService.findAllByProducer(producerId);
  }

  // 📄 Recepciones pendientes por productor
  @Get('producer/:producerId/pending')
  findAllPendingByProducer(@Param('producerId', ParseIntPipe) producerId: number) {
    return this.receptionService.findAllPendingByProducer(producerId);
  }






}
