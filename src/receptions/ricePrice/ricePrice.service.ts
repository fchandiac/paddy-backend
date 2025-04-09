import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RicePrice } from '../../../libs/entities/rice-price.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RicePriceService {
  constructor(
    @InjectRepository(RicePrice)
    private readonly ricePriceRepo: Repository<RicePrice>,
  ) {}

  async health(): Promise<string> {
    return 'RicePriceService is healthy ✅';
  }
}
