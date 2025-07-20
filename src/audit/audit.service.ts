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
    // Limpiar campos con valores N/A o vacíos
    const cleanData = {
      ...data,
      ipAddress: data.ipAddress && data.ipAddress !== 'N/A' && data.ipAddress.trim() !== '' ? data.ipAddress : undefined,
      userAgent: data.userAgent && data.userAgent !== 'N/A' && data.userAgent.trim() !== '' ? data.userAgent : undefined,
      success: data.success ?? true,
    };

    const auditLog = this.auditRepo.create(cleanData);
    
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
      order: { createdAt: 'DESC' }, // Más nuevos primero
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

  // Obtener estadísticas de auditoría
  async getStats(days: number = 30): Promise<AuditStatsDto> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Total de acciones en el período
    const totalActions = await this.auditRepo.count({
      where: { createdAt: Between(cutoffDate, new Date()) },
    });

    // Acciones por tipo
    const actionsByType: Record<AuditAction, number> = {} as any;
    const actions = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT'] as AuditAction[];
    
    for (const action of actions) {
      actionsByType[action] = await this.auditRepo.count({
        where: { 
          action,
          createdAt: Between(cutoffDate, new Date()),
        },
      });
    }

    // Acciones por entidad
    const actionsByEntity: Record<AuditEntityType, number> = {} as any;
    const entities = ['USER', 'PRODUCER', 'RECEPTION', 'RICE_TYPE', 'TEMPLATE', 'TRANSACTION', 'DISCOUNT_PERCENT', 'SYSTEM'] as AuditEntityType[];
    
    for (const entity of entities) {
      actionsByEntity[entity] = await this.auditRepo.count({
        where: { 
          entityType: entity,
          createdAt: Between(cutoffDate, new Date()),
        },
      });
    }

    // Top usuarios (simplificado por ahora)
    const topUsers: Array<{ userId: number; userName: string; actionCount: number }> = [];

    // Actividad reciente
    const recentActivity = await this.auditRepo.find({
      where: { createdAt: Between(cutoffDate, new Date()) },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['user'],
    });

    return {
      totalActions,
      actionsByType,
      actionsByEntity,
      topUsers,
      recentActivity,
    };
  }

  // Limpiar valores inválidos en registros existentes
  async cleanupInvalidValues(): Promise<number> {
    const result = await this.auditRepo.createQueryBuilder()
      .update(AuditLog)
      .set({
        ipAddress: null,
      })
      .where('ipAddress = :na OR ipAddress = :empty OR ipAddress = :localhost1 OR ipAddress = :localhost2', {
        na: 'N/A',
        empty: '',
        localhost1: '::1',
        localhost2: '127.0.0.1'
      })
      .execute();

    const result2 = await this.auditRepo.createQueryBuilder()
      .update(AuditLog)
      .set({
        userAgent: null,
      })
      .where('userAgent = :na OR userAgent = :empty', {
        na: 'N/A',
        empty: ''
      })
      .execute();

    return (result.affected || 0) + (result2.affected || 0);
  }
}
