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
import { SetMetadata } from '@nestjs/common';
export const AUDIT_METADATA_KEY = 'audit_metadata';
export const Audit = (action: AuditAction, entityType: AuditEntityType, description?: string) =>
  SetMetadata(AUDIT_METADATA_KEY, { action, entityType, description });

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditData = this.reflector.get('audit_metadata', context.getHandler());
    if (!auditData) {
      return next.handle(); // No audit needed
    }
    const request = context.switchToHttp().getRequest();
    const { user, ip, headers, method, url, body, params } = request;
    const startTime = Date.now();
    // ...existing code...
    return next.handle().pipe(
      tap(async (response) => {
        // Operación exitosa
        // ...existing code...
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
        // ...existing code...
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

      // Extraer ID de la entidad de los parámetros, respuesta o body
      let entityId = null;
      if (params?.id) {
        const parsedId = parseInt(params.id);
        entityId = !isNaN(parsedId) ? parsedId : null;
      } else if (response?.id && typeof response.id === 'number') {
        entityId = response.id;
      } else if (body?.id && typeof body.id === 'number') {
        entityId = body.id;
      } else if (body?.userId && typeof body.userId === 'number') {
        entityId = body.userId;
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
        ipAddress: ip && ip !== 'N/A' && ip.trim() !== '' ? ip : null,
        userAgent: userAgent && userAgent !== 'N/A' && userAgent.trim() !== '' ? userAgent : null,
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
      console.error('[AUDIT] Error creando log de auditoría:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return null;
    
    // Remover campos sensibles
    const sensitiveFields = ['password', 'pass', 'token', 'secret', 'key'];
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
