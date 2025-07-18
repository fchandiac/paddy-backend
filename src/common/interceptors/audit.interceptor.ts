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
      } else if (auditData.action === 'LOGIN' && response?.user?.id) {
        // Para login exitoso, usar el ID del usuario autenticado
        entityId = response.user.id;
      }

      // Preparar valores anteriores y nuevos según la acción
      let oldValues = null;
      let newValues = null;
      if (auditData.action === 'CREATE') {
        newValues = this.sanitizeData(body);
      } else if (auditData.action === 'UPDATE') {
        newValues = this.sanitizeData(body);
        // Los valores anteriores deberían obtenerse del servicio antes del update
      } else if (auditData.action === 'LOGIN') {
        // Para login, incluir información detallada del intento
        newValues = {
          email: body?.email || null,
          loginSuccessful: success,
          userAgent: userAgent || null,
          timestamp: new Date().toISOString(),
          ipAddress: ip,
          loginResult: success ? 'SUCCESS' : 'FAILED',
          failureReason: success ? null : (errorMessage || 'Login failed'),
        };
      }

      const auditLog = this.auditRepo.create({
        userId: this.getUserIdForAudit(auditData, user, response, success),
        ipAddress: ip && ip !== 'N/A' && ip.trim() !== '' ? ip : null,
        userAgent: userAgent && userAgent !== 'N/A' && userAgent.trim() !== '' ? userAgent : null,
        action: auditData.action,
        entityType: auditData.entityType,
        entityId,
        description: this.generateLoginDescription(auditData, method, url, success, body, errorMessage),
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

  private getUserIdForAudit(auditData: any, user: any, response: any, success: boolean): number | null {
    // Para login exitoso, usar el usuario de la respuesta
    if (auditData.action === 'LOGIN' && success && response?.user?.id) {
      return response.user.id;
    }
    
    // Para login fallido, tratar de obtener el usuario del email si existe
    if (auditData.action === 'LOGIN' && !success) {
      // Para logins fallidos por contraseña incorrecta, podríamos identificar el usuario
      // pero por seguridad, es mejor no exponer si el usuario existe o no
      // Solo loguear userId si el login fue exitoso
      return null;
    }
    
    // Para otras operaciones, usar el usuario del request
    return user?.id || null;
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

  private generateLoginDescription(auditData: any, method: string, url: string, success: boolean, body: any, errorMessage?: string): string {
    const email = body?.email || 'unknown';
    
    if (auditData.action === 'LOGIN') {
      if (success) {
        return `Login exitoso para ${email}`;
      } else {
        const reason = errorMessage || 'Login fallido';
        return `Login fallido para ${email}: ${reason}`;
      }
    }
    
    // Para otras acciones, usar la descripción original
    return auditData.description || this.generateDescription(auditData, method, url);
  }

  private generateDescription(auditData: any, method: string, url: string): string {
    const { action, entityType } = auditData;
    return `${action} operation on ${entityType} via ${method} ${url}`;
  }
}
