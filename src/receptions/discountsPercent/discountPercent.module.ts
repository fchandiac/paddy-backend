import { Module } from '@nestjs/common';
import { DiscountPercentController } from './discountPercent.controller';
import { DiscountPercentService } from './discountPercent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity';
import { User } from '../../../libs/entities/user.entity';
import { AuditModule } from '../../audit/audit.module';
import { JwtAuthGuard } from '../../auth/auth/jwt-auth.guard';
import { AppJwtModule } from '../../auth/auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscountPercent, User]),
    AuditModule,
    AppJwtModule,
  ],
  controllers: [DiscountPercentController],
  providers: [DiscountPercentService, JwtAuthGuard],
})
export class DiscountPercentModule {}
