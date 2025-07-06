import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ReceptionService } from './receptions.service';
import { CreateReceptionDto, UpdateReceptionDto, UpdateReasonDto } from '../../../libs/dto/reception.dto';

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
    // TODO: Obtener userId del contexto de autenticación
    return this.receptionService.create(dto, undefined);
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
    @Query() updateReason: UpdateReasonDto,
  ) {
    // TODO: Obtener userId del contexto de autenticación
    return this.receptionService.update(id, dto, updateReason, undefined);
  }

  // ❌ Eliminar por ID
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // TODO: Obtener userId del contexto de autenticación
    return this.receptionService.remove(id, undefined);
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
  
  // 📜 Historial de cambios por recepción
  @Get(':id/history')
  getReceptionHistory(@Param('id', ParseIntPipe) id: number) {
    return this.receptionService.getReceptionHistory(id);
  }
}
