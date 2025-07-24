import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../../libs/entities/audit-log.entity';
import { DebugController } from '../controllers/debug.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [DebugController],
})
export class DebugModule {}
