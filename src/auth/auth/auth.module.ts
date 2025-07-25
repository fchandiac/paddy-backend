import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../libs/entities/user.entity';
import { AppJwtModule } from './jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    AppJwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
