import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './auth/auth/auth.module';
import { UserModule } from './auth/user/user.module';
import { ProducerModule } from './auth/producer/producer.module';

import { ReceptionsModule } from './receptions/reception/receptions.module';
import { AnalysisParamModule } from './receptions/analysisParam/analysis-param.module';
import { RiceTypeModule } from './receptions/riceType/riceType.module';
import { Template } from 'libs/entities/template.entity';
import { TemplateModule } from './receptions/template/template.module';

import { TransactionModule } from './transactions/transaction/transaction.module';
import { TransactionReferenceModule } from './transactions/transactionReference/transactionReference.module';
import { SeasonModule } from './transactions/season/season.module';

// Audit module
import { AuditModule } from './audit/audit.module';

import { User } from '../libs/entities/user.entity';
import { Producer } from '../libs/entities/producer.entity';
import { RiceType } from '../libs/entities/rice-type.entity';
import { AnalysisParam } from '../libs/entities/analysis-param.entity';
import { Reception } from '../libs/entities/reception.entity';
import { Transaction } from '../libs/entities/transaction.entity';
import { TransactionReference } from '../libs/entities/transaction-reference.entity';
import { AuditLog } from '../libs/entities/audit-log.entity';
import { Season } from '../libs/entities/season.entity';

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
        AnalysisParam,
        Reception,
        Transaction,
        TransactionReference,
        Template,
        AuditLog,
        Season,
      ],
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
    // 🧩 Módulos agrupados por dominio
    AuthModule,
    UserModule,
    ProducerModule,

    ReceptionsModule,
    AnalysisParamModule,
    RiceTypeModule,
    TemplateModule,

    TransactionReferenceModule,
    TransactionModule,

    // Audit module
    AuditModule,
    SeasonModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AppModule {}
