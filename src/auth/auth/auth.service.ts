import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { User } from 'libs/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string; userId: number; email: string; role: string; name: string; user: { id: number; email: string; role: string; name: string } }> {
    const { translate } = require('../../../libs/utils/i18n');
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException(translate('Usuario no encontrado', 'es'));

    if ((user as any).pass !== pass) throw new UnauthorizedException(translate('Contraseña incorrecta', 'es'));

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || user.email, // Agregar el campo name
      user: { id: user.id, email: user.email, role: user.role, name: user.name || user.email }, // Para el interceptor de auditoría
    };
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: 'Auth service is running' };
  }
}
