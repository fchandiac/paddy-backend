import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';

import { AuthModule } from './auth/auth/auth.module';
import { UserModule } from './auth/user/user.module';
import { ProducerModule } from './auth/producer/producer.module';
import { RecordModule } from './auth/record/record.module';

import { ReceptionsModule } from './receptions/reception/receptions.module';
import { DiscountPercentModule } from './receptions/discountsPercent/discountPercent.module';
import { RiceTypeModule } from './receptions/riceType/riceType.module';
import { Template } from 'libs/entities/template.entity';
import { TemplateModule } from './receptions/template/template.module';

import { TransactionModule } from './transactions/transaction/transaction.module';
import { TransactionReferenceModule } from './transactions/transactionReference/transactionReference.module';

import { User } from '../libs/entities/user.entity';
import { Producer } from '../libs/entities/producer.entity';
import { RiceType } from '../libs/entities/rice-type.entity';
import { DiscountPercent } from '../libs/entities/discount-percent.entity';
import { Reception } from '../libs/entities/reception.entity';
import { Transaction } from '../libs/entities/transaction.entity';
import { TransactionReference } from '../libs/entities/transaction-reference.entity';
import { Record } from '../libs/entities/record.entity';

import { envs } from 'libs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: envs.database.host,
      port: parseInt(envs.database.port),
      username: envs.database.user,
      password: envs.database.password,
      database: envs.database.DatabaseName,
      synchronize: true,
      entities: [
        User,
        Producer,
        RiceType,
        DiscountPercent,
        Reception,
        Transaction,
        TransactionReference,
        Record,
        Template,
      ],
    }),

    // 🧩 Módulos agrupados por dominio
    AuthModule,
    UserModule,
    ProducerModule,
    RecordModule,

    ReceptionsModule,
    DiscountPercentModule,
    RiceTypeModule,
    TemplateModule,

    TransactionReferenceModule,
    TransactionModule,
  ],
})
export class AppModule {}
