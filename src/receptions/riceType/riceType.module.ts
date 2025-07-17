import { Module } from '@nestjs/common';
import { RiceTypeController } from './riceType.controller';
import { RiceTypeService } from './riceType.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiceType } from '../../../libs/entities/rice-type.entity';
import { User } from '../../../libs/entities/user.entity';
import { AuditModule } from '../../audit/audit.module';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { AppJwtModule } from '../../auth/auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiceType, User]),
    AuditModule,
    AppJwtModule,
  ],
  controllers: [RiceTypeController],
  providers: [RiceTypeService, JwtAuthGuard],
  exports: [RiceTypeService],
})
export class RiceTypeModule {}
