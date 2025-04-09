import { Module } from '@nestjs/common';
import { RicePriceController } from './ricePrice.controller';
import { RicePriceService } from './ricePrice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RicePrice } from '../../../libs/entities/rice-price.entity'; // Adjust the path if necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([RicePrice]), // Import the RicePrice entity
  ],
  controllers: [RicePriceController],
  providers: [RicePriceService],
  exports: [RicePriceService], // Export the RicePriceService if needed in other modules
})
export class RicePriceModule {}
