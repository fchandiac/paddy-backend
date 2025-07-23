import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';


// Se crearán productor y tipo de arroz antes de la prueba
let createdProducerId: number;
let createdRiceTypeId: number;
let randomProducerName: string;
let randomProducerRut: string;
let randomRiceCode: number;
let randomRiceName: string;

describe('ReceptionController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    httpServer = app.getHttpServer();

    // Login admin
    const loginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({ email: 'admin@ayg.cl', pass: 'admin' });
    expect(loginRes.status).toBe(201);
    adminToken = loginRes.body.access_token || loginRes.body.token;

    // Crear productor
    randomProducerName = 'TestProductor_' + Math.floor(Math.random() * 1000000);
    randomProducerRut = Math.floor(Math.random() * 10000000 + 10000000) + '-' + Math.floor(Math.random() * 10);
    const producerDto = {
      name: randomProducerName,
      businessName: randomProducerName + ' SpA',
      rut: randomProducerRut,
      address: 'Calle Test 123',
      phone: '+56912345678'
    };
    const producerRes = await request(httpServer)
      .post('/producers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(producerDto);
    expect(producerRes.status).toBe(201);
    createdProducerId = producerRes.body.id;

    // Crear tipo de arroz
    randomRiceCode = Math.floor(Math.random() * 1000000) + 1000;
    randomRiceName = 'TestArroz_' + Math.floor(Math.random() * 1000000);
    const riceTypeDto = { code: randomRiceCode, name: randomRiceName, description: 'Arroz test', price: 123.45, enable: true };
    const riceTypeRes = await request(httpServer)
      .post('/rice-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(riceTypeDto);
    expect(riceTypeRes.status).toBe(201);
    createdRiceTypeId = riceTypeRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/receptions (POST) crea una recepción', async () => {
    const receptionDto = {
      producerId: createdProducerId,
      riceTypeId: createdRiceTypeId,
      price: 1000,
      guide: 'G-001',
      licensePlate: 'ABCD12',
      grossWeight: 5000,
      tare: 1000,
      netWeight: 4000,
      percentHumedad: 14.5,
      toleranceHumedad: 1.0,
      percentGranosVerdes: 2.0,
      toleranceGranosVerdes: 0.5,
      percentImpurezas: 1.2,
      toleranceImpurezas: 0.3,
      percentGranosManchados: 0.5,
      toleranceGranosManchados: 0.2,
      percentHualcacho: 0.1,
      toleranceHualcacho: 0.05,
      percentGranosPelados: 0.2,
      toleranceGranosPelados: 0.05,
      percentGranosYesosos: 0.1,
      toleranceGranosYesosos: 0.05,
      percentVano: 0.1,
      toleranceVano: 0.05,
      toleranceBonificacion: 0.1,
      percentSecado: 0.1,
      totalDiscount: 10,
      bonus: 5,
      paddyNet: 3990,
      status: 'pending',
      note: 'Recepción de prueba'
    };
    const res = await request(httpServer)
      .post('/receptions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(receptionDto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.producerId).toBe(receptionDto.producerId);
    expect(res.body.riceTypeId).toBe(receptionDto.riceTypeId);
    // Aquí podrías agregar verificación de auditoría si tienes endpoint para logs
  });
});
