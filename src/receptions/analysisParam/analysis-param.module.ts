import { Module } from '@nestjs/common';
import { AnalysisParamController } from './analysis-param.controller';
import { AnalysisParamService } from './analysis-param.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisParam } from '../../../libs/entities/analysis-param.entity';
import { User } from '../../../libs/entities/user.entity';
import { AuditModule } from '../../audit/audit.module';
import { JweAuthGuard } from '../../auth/jwe/jwe-auth.guard';
import { JweModule } from '../../auth/jwe/jwe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalysisParam, User]),
    AuditModule,
    JweModule,
  ],
  controllers: [AnalysisParamController],
  providers: [AnalysisParamService, JweAuthGuard],
})
export class AnalysisParamModule {}
