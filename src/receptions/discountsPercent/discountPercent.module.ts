import { Module } from '@nestjs/common';
import { DiscountPercentController } from './discountPercent.controller';
import { DiscountPercentService } from './discountPercent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountPercent } from '../../../libs/entities/discount-percent.entity'; // Adjust the path if necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscountPercent]), // Import the DiscountPercent entity
  ],
  controllers: [DiscountPercentController],
  providers: [DiscountPercentService],

})
export class DiscountPercentModule {}
