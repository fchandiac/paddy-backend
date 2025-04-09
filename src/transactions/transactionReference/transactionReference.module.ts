import { Module } from '@nestjs/common';
import { TransactionReferenceController } from './transactionReference.controller';
import { TransactionReferenceService } from './transactionReference.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionReference } from '../../../libs/entities/transaction-reference.entity'; // Adjust the path if necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionReference]), // Import the TransactionReference entity
  ],
  controllers: [TransactionReferenceController],
  providers: [TransactionReferenceService],
  exports: [TransactionReferenceService], // Export the TransactionReferenceService if needed in other modules
})
export class TransactionReferenceModule {}
