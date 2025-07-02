import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from '../../../libs/entities/producer.entity'; // ✅ corrige la ruta si estás dentro de src/auth/producer/
import { TransactionModule } from 'src/transactions/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producer]), 
    TransactionModule,
  ],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
