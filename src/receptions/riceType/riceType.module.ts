import { Module } from '@nestjs/common';
import { RiceTypeController } from './riceType.controller';
import { RiceTypeService } from './riceType.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiceType } from '../../../libs/entities/rice-type.entity';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiceType]),
    AuditModule,
  ],
  controllers: [RiceTypeController],
  providers: [RiceTypeService],
  exports: [RiceTypeService],
})
export class RiceTypeModule {}
