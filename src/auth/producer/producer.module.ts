import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from '../../../libs/entities/producer.entity';
import { User } from '../../../libs/entities/user.entity';
import { TransactionModule } from 'src/transactions/transaction/transaction.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppJwtModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producer, User]), 
    TransactionModule,
    AppJwtModule,
  ],
  controllers: [ProducerController],
  providers: [ProducerService, JwtAuthGuard],
  exports: [ProducerService],
})
export class ProducerModule {}
