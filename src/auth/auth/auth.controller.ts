import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  signIn(@Body() body: { email: string; pass: string }) {
    return this.authService.signIn(body.email, body.pass);
  }

  @Get('health')
  healthCheck() {
    return this.authService.healthCheck();
  }
}
