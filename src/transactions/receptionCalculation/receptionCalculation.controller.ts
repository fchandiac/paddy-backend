import { Controller, Get } from '@nestjs/common';
import { ReceptionCalculationService } from './receptionCalculation.service';

@Controller('reception-calculation')
export class ReceptionCalculationController {
  constructor(private readonly receptionCalculationService: ReceptionCalculationService) {}

  @Get('health')
  async getHealth(): Promise<string> {
    return await this.receptionCalculationService.health();
  }
}
