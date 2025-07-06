import { Module } from '@nestjs/common';
import { DiscountPercentController } from './discountPercent.controller';
import { DiscountPercentService } from './discountPercent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity'; // Adjust the path if necessary
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscountPercent]), // Import the DiscountPercent entity
    AuditModule, // Import AuditModule to access AuditService
  ],
  controllers: [DiscountPercentController],
  providers: [DiscountPercentService],
})
export class DiscountPercentModule {}
