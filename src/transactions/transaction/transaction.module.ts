import { Season } from '../../../libs/entities/season.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ agregar esto
import { Transaction } from '../../../libs/entities/transaction.entity'; // ✅ corrige la ruta si estás dentro de src/transactions/transaction/
import { TransactionController } from './transaction.controller';
import { AdvanceTransactionController } from './advance-transaction.controller';
import { AdvanceTransactionService } from './advance-transaction.service';
import { TransactionService } from './transaction.service';
import { User } from '../../../libs/entities/user.entity'; // ✅ corrige la ruta si estás dentro de src/transactions/transaction/
import { Producer } from '../../../libs/entities/producer.entity'; // ✅ corrige la ruta si estás dentro de src/transactions/transaction/
import { JwtModule } from '@nestjs/jwt';
import { JweModule } from '../../auth/jwe/jwe.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Producer, Season]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
    JweModule,
  ],
  controllers: [TransactionController, AdvanceTransactionController],
  providers: [TransactionService, AdvanceTransactionService],
  exports: [TransactionService, AdvanceTransactionService],
})
export class TransactionModule {}