import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ agregar esto
import { Transaction } from '../../../libs/entities/transaction.entity'; // ✅ corrige la ruta si estás dentro de src/transactions/transaction/
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { User } from '../../../libs/entities/user.entity'; // ✅ corrige la ruta si estás dentro de src/transactions/transaction/
import { Producer } from '../../../libs/entities/producer.entity'; // ✅ corrige la ruta si estás dentro de src/transactions/transaction/
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Producer]), // ✅ este es el fix real
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}