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
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';
import { ReceptionService } from './receptions.service';
import { CreateReceptionDto, UpdateReceptionDto, UpdateReasonDto } from '../../../libs/dto/reception.dto';

@Controller('receptions')
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
    @Headers('x-user-email') userEmail?: string,
    @Headers('x-created-by') createdBy?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Query('createdBy') queryCreatedBy?: string,
    @Query('userId') queryUserId?: string,
  ) {
    // ...existing code...
    const finalCreatedBy = createdBy || queryCreatedBy || userEmail || 'Sistema';
    const finalUserId = headerUserId || queryUserId;
    // ...existing code...
    const userId = finalUserId ? parseInt(finalUserId, 10) : undefined;
    return this.receptionService.create(dto, userId, userEmail || queryCreatedBy);
  }

  // 📄 Listar todas las recepciones
  @Get()
  @Audit('VIEW', 'RECEPTION', 'Listar todas las recepciones')
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
