import { Module } from '@nestjs/common';
import { ReceptionCalculationController } from './receptionCalculation.controller';
import { ReceptionCalculationService } from './receptionCalculation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceptionCalculation } from '../../../libs/entities/reception-calculation.entity'; // Adjust the path if necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([ReceptionCalculation]), // Import the ReceptionCalculation entity
  ],
  controllers: [ReceptionCalculationController],
  providers: [ReceptionCalculationService],
  exports: [ReceptionCalculationService], // Export the ReceptionCalculationService if needed in other modules
})
export class ReceptionCalculationModule {}
