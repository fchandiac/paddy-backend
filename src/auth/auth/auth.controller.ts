import { Controller, Post, Body, Get, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';

@Controller('auth')
@UseInterceptors(AuditInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  // --- AUDITORÍA DE LOGIN ---
  // Este endpoint audita todos los intentos de login (exitosos y fallidos) usando @Audit.
  // No es necesario diferenciar origen aquí, ya que siempre es acción de usuario.
  @Post('sign-in')
  @Audit('LOGIN', 'USER', 'Intento de login')
  signIn(@Body() body: { email: string; pass: string }) {
    return this.authService.signIn(body.email, body.pass);
  }

  @Get('health')
  @Audit('VIEW', 'SYSTEM', 'Verificar salud del servicio de autenticación')
  healthCheck() {
    return this.authService.healthCheck();
  }
}
