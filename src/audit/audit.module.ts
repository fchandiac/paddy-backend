import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../libs/entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@Global() // Hace que el servicio esté disponible globalmente
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, AuditInterceptor],
  controllers: [AuditController],
  exports: [
    AuditService, 
    AuditInterceptor, 
    TypeOrmModule, // Exportar TypeOrmModule para que el repositorio esté disponible
  ],
})
export class AuditModule {}
