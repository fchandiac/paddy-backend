import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { AuditService, AuditFilterDto } from './audit.service';
import { AuditAction, AuditEntityType } from '../../libs/entities/audit-log.entity';

// Aquí asumo que tienes un guard de autenticación y roles
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // Obtener logs con filtros
  @Get()
  async getAuditLogs(@Query() query: any) {
    const filters: AuditFilterDto = {
      userId: query.userId ? parseInt(query.userId) : undefined,
      action: query.action as AuditAction,
      entityType: query.entityType as AuditEntityType,
      entityId: query.entityId ? parseInt(query.entityId) : undefined,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      success: query.success ? query.success === 'true' : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 50,
    };

    return await this.auditService.findAuditLogs(filters);
  }

  // Obtener estadísticas de auditoría
  @Get('stats')
  async getStats(@Query('days') days: number = 30) {
    return this.auditService.getStats(days);
  }

  // Obtener logs de un usuario específico
  @Get('user/:userId')
  async getUserAuditLogs(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit) : 100;
    return await this.auditService.getUserAuditLogs(userId, limitNumber);
  }

  // Obtener logs de una entidad específica
  @Get('entity/:entityType/:entityId')
  async getEntityAuditLogs(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return await this.auditService.getEntityAuditLogs(entityType, entityId);
  }

  // Limpiar logs antiguos (solo para super admin)
  @Get('cleanup/:days')
  async cleanOldLogs(@Param('days', ParseIntPipe) days: number) {
    return {
      deleted: await this.auditService.cleanOldLogs(days),
      message: `Logs older than ${days} days have been deleted`,
    };
  }

  // Crear log de auditoría manual desde frontend
  @Post('manual')
  async createManualLog(
    @Body() logData: {
      userId?: number;
      action: AuditAction;
      entityType: AuditEntityType;
      entityId?: number;
      description: string;
      metadata?: any;
      oldValues?: any;
      newValues?: any;
      success?: boolean;
      errorMessage?: string;
    },
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    return this.auditService.createAuditLog({
      ...logData,
      ipAddress: ip && ip !== '::1' && ip !== '127.0.0.1' ? ip : undefined,
      userAgent: userAgent && userAgent.trim() !== '' ? userAgent : undefined,
    });
  }

  // Limpiar valores inválidos en registros existentes
  @Post('cleanup-invalid-values')
  async cleanupInvalidValues() {
    return {
      cleaned: await this.auditService.cleanupInvalidValues(),
      message: 'Invalid IP addresses and user agents have been cleaned',
    };
  }
}
