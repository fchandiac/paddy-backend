import { Module } from '@nestjs/common';
import { TransactionReferenceController } from './transactionReference.controller';
import { TransactionReferenceService } from './transactionReference.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionReference } from '../../../libs/entities/transaction-reference.entity';
import { Transaction } from '../../../libs/entities/transaction.entity';
import { Producer } from '../../../libs/entities/producer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionReference, Transaction, Producer]),
  ],
  controllers: [TransactionReferenceController],
  providers: [TransactionReferenceService],
  exports: [TransactionReferenceService],
})
export class TransactionReferenceModule {}
