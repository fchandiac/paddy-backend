import { Module } from '@nestjs/common';
import { RiceTypeController } from './riceType.controller';
import { RiceTypeService } from './riceType.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiceType } from '../../../libs/entities/rice-type.entity'; // Adjust the path if necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([RiceType]), // Import the RiceType entity
  ],
  controllers: [RiceTypeController],
  providers: [RiceTypeService],
  exports: [RiceTypeService], // Export the RiceTypeService if needed in other modules
})
export class RiceTypeModule {}
