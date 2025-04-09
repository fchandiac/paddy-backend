import { Controller, Get } from '@nestjs/common';
import { RicePriceService } from './ricePrice.service';

@Controller('rice-price')
export class RicePriceController {
  constructor(private readonly ricePriceService: RicePriceService) {}

  @Get('health')
  async getHealth(): Promise<string> {
    return await this.ricePriceService.health();
  }
}
