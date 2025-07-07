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
  create(
    @Body() dto: CreateReceptionDto,
    @Headers('x-user-email') userEmail?: string,
    @Headers('x-created-by') createdBy?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Query('createdBy') queryCreatedBy?: string,
    @Query('userId') queryUserId?: string,
  ) {
    // Obtener información del usuario desde headers o query parameters
    const finalCreatedBy = createdBy || queryCreatedBy || userEmail || 'Sistema';
    const finalUserId = headerUserId || queryUserId;
    
    console.log('🔐 BACKEND DEBUG - Información de usuario recibida:');
    console.log('Headers - userEmail:', userEmail);
    console.log('Headers - createdBy:', createdBy);
    console.log('Headers - userId:', headerUserId);
    console.log('Query - createdBy:', queryCreatedBy);
    console.log('Query - userId:', queryUserId);
    console.log('Final - createdBy:', finalCreatedBy);
    console.log('Final - userId:', finalUserId);
    
    const userId = finalUserId ? parseInt(finalUserId, 10) : undefined;
    
    return this.receptionService.create(dto, userId, userEmail || queryCreatedBy);
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
