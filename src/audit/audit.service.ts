import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from '../../libs/entities/audit-log.entity';

export interface AuditFilterDto {
  userId?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  page?: number;
  limit?: number;
}

export interface AuditStatsDto {
  totalActions: number;
  actionsByType: Record<AuditAction, number>;
  actionsByEntity: Record<AuditEntityType, number>;
  topUsers: Array<{ userId: number; userName: string; actionCount: number }>;
  recentActivity: AuditLog[];
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  // Crear log de auditoría manualmente
  async createAuditLog(data: {
    userId?: number;
    ipAddress?: string;
    userAgent?: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: number;
    description: string;
    metadata?: any;
    oldValues?: any;
    newValues?: any;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditRepo.create({
      ...data,
      success: data.success ?? true,
    });
    
    return await this.auditRepo.save(auditLog);
  }

  // Obtener logs con filtros
  async findAuditLogs(filters: AuditFilterDto): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      success,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (success !== undefined) where.success = success;

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = { $gte: startDate };
    } else if (endDate) {
      where.createdAt = { $lte: endDate };
    }

    const options: FindManyOptions<AuditLog> = {
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.auditRepo.findAndCount(options);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // Obtener estadísticas de auditoría
  async getAuditStats(days: number = 30): Promise<AuditStatsDto> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total de acciones
    const totalActions = await this.auditRepo.count({
      where: {
        createdAt: { $gte: startDate } as any,
      },
    });

    // Acciones por tipo
    const actionsByTypeQuery = await this.auditRepo
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.action')
      .getRawMany();

    const actionsByType: Record<AuditAction, number> = {} as any;
    actionsByTypeQuery.forEach(row => {
      actionsByType[row.action] = parseInt(row.count);
    });

    // Acciones por entidad
    const actionsByEntityQuery = await this.auditRepo
      .createQueryBuilder('audit')
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate })
      .groupBy('audit.entityType')
      .getRawMany();

    const actionsByEntity: Record<AuditEntityType, number> = {} as any;
    actionsByEntityQuery.forEach(row => {
      actionsByEntity[row.entityType] = parseInt(row.count);
    });

    // Top usuarios más activos
    const topUsersQuery = await this.auditRepo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .select('audit.userId', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect('COUNT(*)', 'actionCount')
      .where('audit.createdAt >= :startDate', { startDate })
      .andWhere('audit.userId IS NOT NULL')
      .groupBy('audit.userId')
      .orderBy('actionCount', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsers = topUsersQuery.map(row => ({
      userId: row.userId,
      userName: row.userName || 'Usuario desconocido',
      actionCount: parseInt(row.actionCount),
    }));

    // Actividad reciente
    const recentActivity = await this.auditRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      totalActions,
      actionsByType,
      actionsByEntity,
      topUsers,
      recentActivity,
    };
  }

  // Obtener logs de un usuario específico
  async getUserAuditLogs(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return await this.auditRepo.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Obtener logs de una entidad específica
  async getEntityAuditLogs(entityType: AuditEntityType, entityId: number): Promise<AuditLog[]> {
    return await this.auditRepo.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Limpiar logs antiguos
  async cleanOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
