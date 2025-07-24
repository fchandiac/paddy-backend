import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../libs/entities/audit-log.entity';

@Controller('debug')
export class DebugController {
  private readonly logger = new Logger('DebugController');

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('audit-count')
  async getAuditCount() {
    try {
      const count = await this.auditRepo.count();
      const recentLogs = await this.auditRepo.find({
        order: { createdAt: 'DESC' },
        take: 5
      });
      
      return {
        success: true,
        count,
        recentLogs
      };
    } catch (error) {
      this.logger.error('Error getting audit count', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('manual-audit')
  async createManualAudit(@Body() data: any) {
    try {
      const { userId, action, entityType, entityId, description } = data;
      
      const auditLog = this.auditRepo.create({
        userId: userId || null,
        action,
        entityType,
        entityId,
        description: description || `Manual audit log created for ${entityType} ${entityId}`,
        success: true,
        metadata: {
          manual: true,
          timestamp: new Date().toISOString(),
        },
      });
      
      const result = await this.auditRepo.save(auditLog);
      
      return {
        success: true,
        auditLog: result
      };
    } catch (error) {
      this.logger.error('Error creating manual audit', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
