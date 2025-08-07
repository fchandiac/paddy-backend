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
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuditInterceptor, Audit, AuditUserQuery } from '../../common/interceptors/audit.interceptor';
import { ReceptionService } from './receptions.service';
import { CreateReceptionDto, UpdateReceptionDto, UpdateReasonDto } from '../../../libs/dto/reception.dto';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
@Controller('receptions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  // 🧪 Healthcheck
  @Get('health')
  @Audit('VIEW', 'RECEPTION', 'Verificar salud del servicio de recepciones')
  health() {
    return 'Reception service is running';
  }

  // 📥 Crear una recepción
  @Post()
  @Audit('CREATE', 'RECEPTION', 'Crear recepción')
  create(
    @Body() dto: CreateReceptionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.receptionService.create(dto, userId);
  }

  // 📄 Listar todas las recepciones
  @Get()
  @AuditUserQuery('VIEW', 'RECEPTION', 'Consulta de recepciones por usuario')
  findAll() {
    return this.receptionService.findAll();
  }

  // 📄 Buscar por ID
  @Get(':id')
  @Audit('VIEW', 'RECEPTION', 'Buscar recepción por ID')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receptionService.findOne(id);
  }

  // ✏️ Actualizar por ID
  @Patch(':id')
  @Audit('UPDATE', 'RECEPTION', 'Actualizar recepción')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReceptionDto,
    @Query() updateReason: UpdateReasonDto,
  ) {
    // ...existing code...
    return this.receptionService.update(id, dto, updateReason, undefined);
  }

  // ❌ Eliminar por ID
  @Delete(':id')
  @Audit('DELETE', 'RECEPTION', 'Eliminar recepción')
  remove(@Param('id', ParseIntPipe) id: number) {
    // ...existing code...
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
