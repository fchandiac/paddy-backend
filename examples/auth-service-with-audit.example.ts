// Ejemplo de uso manual del AuditService en un servicio

import { Injectable } from '@nestjs/common';
import { AuditService } from '../src/audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly auditService: AuditService,
  ) {}

  async login(email: string, password: string, request: any) {
    try {
      // Lógica de login... (ejemplo)
      // const user = await this.validateUser(email, password);
      const user = { id: 1, email }; // Simulado para el ejemplo
      
      if (user) {
        // Registrar login exitoso
        await this.auditService.createAuditLog({
          userId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          action: 'LOGIN',
          entityType: 'SYSTEM',
          description: `Usuario ${user.email} inició sesión`,
          metadata: {
            loginTime: new Date().toISOString(),
            method: 'email_password',
          },
          success: true,
        });
        
        return user;
      } else {
        // Registrar intento de login fallido
        await this.auditService.createAuditLog({
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          action: 'LOGIN',
          entityType: 'SYSTEM',
          description: `Intento de login fallido para email: ${email}`,
          metadata: {
            email,
            failureReason: 'invalid_credentials',
          },
          success: false,
          errorMessage: 'Credenciales inválidas',
        });
        
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      // Registrar error de sistema
      await this.auditService.createAuditLog({
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        action: 'LOGIN',
        entityType: 'SYSTEM',
        description: `Error durante login para email: ${email}`,
        metadata: {
          email,
          errorDetails: error.message,
        },
        success: false,
        errorMessage: error.message,
      });
      
      throw error;
    }
  }

  async logout(userId: number, request: any) {
    await this.auditService.createAuditLog({
      userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      action: 'LOGOUT',
      entityType: 'SYSTEM',
      description: 'Usuario cerró sesión',
      metadata: {
        logoutTime: new Date().toISOString(),
      },
      success: true,
    });
  }
}
