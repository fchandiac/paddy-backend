import { Module } from '@nestjs/common';
import { AnalysisParamController } from './analysis-param.controller';
import { AnalysisParamService } from './analysis-param.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisParam } from '../../../libs/entities/analysis-param.entity';
import { User } from '../../../libs/entities/user.entity';
import { AuditModule } from '../../audit/audit.module';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { AppJwtModule } from '../../auth/auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalysisParam, User]),
    AuditModule,
    AppJwtModule,
  ],
  controllers: [AnalysisParamController],
  providers: [AnalysisParamService, JwtAuthGuard],
})
export class AnalysisParamModule {}
