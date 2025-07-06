import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from '../../../libs/entities/audit-log.entity';
import { Reflector } from '@nestjs/core';

// Decorator para marcar endpoints que deben ser auditados
export const Audit = (action: AuditAction, entityType: AuditEntityType, description?: string) => {
  return Reflector.createDecorator<{ action: AuditAction; entityType: AuditEntityType; description?: string }>()({
    action,
    entityType,
    description,
  });
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditData = this.reflector.get(Audit, context.getHandler());
    
    if (!auditData) {
      return next.handle(); // No audit needed
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, headers, method, url, body, params } = request;
    
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(async (response) => {
        // Operación exitosa
        await this.createAuditLog({
          auditData,
          user,
          ip,
          userAgent: headers['user-agent'],
          method,
          url,
          body,
          params,
          response,
          success: true,
          duration: Date.now() - startTime,
        });
      }),
      catchError(async (error) => {
        // Operación fallida
        await this.createAuditLog({
          auditData,
          user,
          ip,
          userAgent: headers['user-agent'],
          method,
          url,
          body,
          params,
          success: false,
          errorMessage: error.message,
          duration: Date.now() - startTime,
        });
        throw error;
      }),
    );
  }

  private async createAuditLog(data: any) {
    try {
      const {
        auditData,
        user,
        ip,
        userAgent,
        method,
        url,
        body,
        params,
        response,
        success,
        errorMessage,
        duration,
      } = data;

      // Extraer ID de la entidad de los parámetros o respuesta
      let entityId = null;
      if (params?.id) {
        entityId = parseInt(params.id);
      } else if (response?.id) {
        entityId = response.id;
      }

      // Preparar valores anteriores y nuevos según la acción
      let oldValues = null;
      let newValues = null;
      
      if (auditData.action === 'CREATE') {
        newValues = this.sanitizeData(body);
      } else if (auditData.action === 'UPDATE') {
        newValues = this.sanitizeData(body);
        // Los valores anteriores deberían obtenerse del servicio antes del update
      }

      const auditLog = this.auditRepo.create({
        userId: user?.id || null,
        ipAddress: ip,
        userAgent,
        action: auditData.action,
        entityType: auditData.entityType,
        entityId,
        description: auditData.description || this.generateDescription(auditData, method, url),
        metadata: {
          method,
          url,
          duration,
          timestamp: new Date().toISOString(),
        },
        oldValues,
        newValues,
        success,
        errorMessage,
      });

      await this.auditRepo.save(auditLog);
    } catch (error) {
      // No fallar la operación principal si falla el audit
      console.error('Error creating audit log:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return null;
    
    // Remover campos sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private generateDescription(auditData: any, method: string, url: string): string {
    const { action, entityType } = auditData;
    return `${action} operation on ${entityType} via ${method} ${url}`;
  }
}
