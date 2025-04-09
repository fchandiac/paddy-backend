import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';

import { AuthModule } from './auth/auth/auth.module';
import { UserModule } from './auth/user/user.module';
import { ProducerModule } from './auth/producer/producer.module';
import { RecordModule } from './auth/record/record.module';

import { ReceptionsModule } from './receptions/reception/receptions.module';
import { DiscountPercentModule } from './receptions/discountsPercent/discountPercent.module';
import { RicePriceModule } from './receptions/ricePrice/ricePrice.module';
import { RiceTypeModule } from './receptions/riceType/riceType.module';
import { DiscountTemplate } from 'libs/entities/discount-template.entity';
import { DiscountTemplateModule } from './receptions/discountTemplate/discount-template.module';


import { ReceptionCalculationModule } from './transactions/receptionCalculation/receptionCalculation.module';
import { TransactionModule } from './transactions/transaction/transaction.module';
import { TransactionReferenceModule } from './transactions/transactionReference/transactionReference.module';

import { User } from '../libs/entities/user.entity';
import { Producer } from '../libs/entities/producer.entity';
import { RiceType } from '../libs/entities/rice-type.entity';
import { RicePrice } from '../libs/entities/rice-price.entity';
import { DiscountPercent } from '../libs/entities/discount-percent.entity';
import { Reception } from '../libs/entities/reception.entity';
import { ReceptionCalculation } from '../libs/entities/reception-calculation.entity';
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
      ssl: {
        ca: fs.readFileSync(envs.database.caCertPath || './cert/ca.pem').toString(),
      },
      extra: {
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectionLimit: 10,
      },
      synchronize: true,

      entities: [
        User,
        Producer,
        RiceType,
        RicePrice,
        DiscountPercent,
        Reception,
        ReceptionCalculation,
        Transaction,
        TransactionReference,
        Record,
        DiscountTemplate,
      ],
    }),

    // 🧩 Módulos agrupados por dominio
    AuthModule,
    UserModule,
    ProducerModule,
    RecordModule,

    ReceptionsModule,
    DiscountPercentModule,
    RicePriceModule,
    RiceTypeModule,
    DiscountTemplateModule,

    ReceptionCalculationModule,
    TransactionReferenceModule,
    TransactionModule,
  ],
})
export class AppModule {}
