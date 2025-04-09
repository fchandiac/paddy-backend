import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionReference } from '../../../libs/entities/transaction-reference.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionReferenceService {
  constructor(
    @InjectRepository(TransactionReference)
    private readonly refRepo: Repository<TransactionReference>,
  ) {}

  async health(): Promise<string> {
    return 'TransactionReferenceService is healthy ✅';
  }
}
