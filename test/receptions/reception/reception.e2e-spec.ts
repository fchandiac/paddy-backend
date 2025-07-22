import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reception } from 'libs/entities/reception.entity';
import { ReceptionsModule } from '../../../src/receptions/reception/receptions.module';
import { User } from 'libs/entities/user.entity';
import { Producer } from 'libs/entities/producer.entity';
import { RiceType } from 'libs/entities/rice-type.entity';

// Ajusta los datos de ejemplo según tu modelo
const receptionDto = {
  producerId: 1,
  riceTypeId: 1,
  price: 1000,
  guide: 'G-001',
  licensePlate: 'ABCD12',
  grossWeight: 5000,
  tareWeight: 1000,
  netWeight: 4000,
  humidity: 14.5,
  impurities: 1.2,
  broken: 0.5,
  grains: 1000,
  // agrega los campos requeridos por tu modelo
};

describe('ReceptionController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Reception, User, Producer, RiceType],
          synchronize: true,
        }),
        ReceptionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/receptions (POST) crea una recepción', async () => {
    const res = await request(app.getHttpServer())
      .post('/receptions')
      .send(receptionDto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.producerId).toBe(receptionDto.producerId);
    expect(res.body.riceTypeId).toBe(receptionDto.riceTypeId);
  });
});
