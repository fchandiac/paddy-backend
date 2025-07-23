import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

describe('Anticipo + Pago + Auditoría (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let adminToken: string;
  let userId: number;
  let producerId: number;
  let advanceId: number;
  let paymentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
    );
    await app.init();
    httpServer = app.getHttpServer();

    // Limpiar transacciones antes de los tests
    await request(httpServer)
      .delete('/transactions/clear')
      .set('Authorization', `Bearer adminToken`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Debe hacer login y obtener token', async () => {
    const res = await request(httpServer)
      .post('/auth/sign-in')
      .send({ email: 'admin@ayg.cl', pass: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    adminToken = res.body.access_token || '';
    userId = res.body.userId;
  });

  it('Debe obtener un productor válido', async () => {
    const res = await request(httpServer)
      .get('/producers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    producerId = res.body[0]?.id;
    expect(producerId).toBeDefined();
  });

  it('Debe crear un pago asociado', async () => {
    const paymentDto = {
      userId,
      producerId,
      typeCode: 6, // PAYMENT
      debit: 0,
      credit: 100000,
      description: 'Pago de anticipo test',
      previousBalance: 0,
      balance: 100000,
      details: {
        originAccount: '123456789',
        destinationAccount: '987654321',
        transactionCode: 'BANK123',
        concept: 'Anticipo',
      },
    };
    const res = await request(httpServer)
      .post('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(paymentDto);
    if (res.status !== 201) {
      console.error('Error al crear pago:', res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    paymentId = res.body.id;
  });

  it('Debe crear un anticipo asociado al pago', async () => {
    const advanceDto = {
      userId,
      producerId,
      typeCode: 1, // ADVANCE
      debit: 100000,
      credit: 0,
      description: 'Anticipo test',
      previousBalance: 0,
      balance: 100000,
      details: {
        paymentId,
        advanceRate: 0.7,
      },
    };
    const res = await request(httpServer)
      .post('/transactions/advance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(advanceDto);
    if (res.status !== 201) {
      console.error('Error al crear anticipo:', res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    advanceId = res.body.id;
  });

  it('Debe verificar que existe un log de auditoría para la creación del anticipo', async () => {
    const res = await request(httpServer)
      .get(`/audit?entityType=TRANSACTION&action=CREATE&entityId=${advanceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const logs = res.body.data || res.body;
    const found = logs.find((log: any) =>
      log.entityId === advanceId &&
      log.action === 'CREATE' &&
      log.entityType === 'TRANSACTION' &&
      log.newValues?.typeCode === 1 &&
      log.newValues?.debit === 100000
    );
    expect(found).toBeDefined();
    expect(found.entityType).toBe('TRANSACTION');
    expect(found.action).toBe('CREATE');
    expect(found.newValues.debit).toBe(100000);
    expect(found.newValues.details.advanceRate).toBe(0.7);
    expect(found.newValues.details.paymentId).toBe(paymentId);
  });
});
