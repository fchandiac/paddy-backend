import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceptionCalculation } from '../../../libs/entities/reception-calculation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReceptionCalculationService {
  constructor(
    @InjectRepository(ReceptionCalculation)
    private readonly calcRepo: Repository<ReceptionCalculation>,
  ) {}

  async health(): Promise<string> {
    return 'ReceptionCalculationService is healthy ✅';
  }
}
