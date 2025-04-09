import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'libs/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async signIn(email: string, pass: string): Promise<{ userId: number; email: string; role: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    if ((user as any).pass !== pass) throw new UnauthorizedException('Contraseña incorrecta');

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async healthCheck(): Promise<{ status: string }> {
    return { status: 'Auth service is running' };
  }
}
