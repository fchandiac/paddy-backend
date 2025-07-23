import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { User } from '../../../libs/entities/user.entity'; 
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppJwtModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AppJwtModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard],
  exports: [UserService], 
})
export class UserModule {}
