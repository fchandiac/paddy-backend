import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

describe('RiceType + Auditoría (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let adminToken: string;
  let createdRiceTypeId: number;
  let createdRiceType: any;
  let randomRiceCode: number;
  let randomRiceName: string;
  let usedCodes: number[] = [];
  let usedNames: string[] = [];

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
    dataSource = app.get(DataSource);

    // Obtener los códigos y nombres ya usados
    const res = await request(httpServer)
      .get('/rice-types')
      .set('Authorization', `Bearer ${adminToken}`);
    usedCodes = (res.body || []).map((rt: any) => rt.code);
    usedNames = (res.body || []).map((rt: any) => rt.name);

    // Generar código y nombre únicos
    do {
      randomRiceCode = Math.floor(Math.random() * 1000000) + 1000;
      randomRiceName = 'TestArroz_' + Math.floor(Math.random() * 1000000);
    } while (usedCodes.includes(randomRiceCode) || usedNames.includes(randomRiceName));
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
    adminToken = res.body.token || '';
  });

  it('Debe crear un tipo de arroz', async () => {
    const riceTypeDto = { code: randomRiceCode, name: randomRiceName, description: 'Arroz test', price: 123.45, enable: true };
    const res = await request(httpServer)
      .post('/rice-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(riceTypeDto);
    if (res.status !== 201) {
      console.error('Error al crear tipo de arroz:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdRiceTypeId = res.body.id;
    createdRiceType = res.body;
  });

  it('Debe verificar que el tipo de arroz fue creado', async () => {
    const res = await request(httpServer)
      .get(`/rice-types/${createdRiceTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    if (res.status !== 200) {
      console.error('Error al consultar tipo de arroz:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(randomRiceName);
  });

  it('Debe verificar que existe un log de auditoría para la creación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=RICE_TYPE&action=CREATE')
      .set('Authorization', `Bearer ${adminToken}`);
    // Mostrar la respuesta completa para depuración
    console.log('Respuesta completa de /audit:', JSON.stringify(res.body, null, 2));
    const logs = res.body.data || res.body;
    // Buscar el log más reciente que coincida con el entityId y acción
    const found = logs
      .filter((log) => log.entityId === createdRiceTypeId && log.action === 'CREATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (!found) {
      console.error('No se encontró log de auditoría para el tipo de arroz creado. Logs recibidos:', logs);
    }
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    // Comparar los datos relevantes del arroz creado con los del log
    expect(found.entityId).toBe(createdRiceTypeId);
    expect(found.entityType).toBe('RICE_TYPE');
    expect(found.action).toBe('CREATE');
    // Comparar campos clave (usar newValues, no data)
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.code).toBe(createdRiceType.code);
    expect(logNewValues.name).toBe(createdRiceType.name);
    expect(logNewValues.description).toBe(createdRiceType.description);
    expect(logNewValues.price).toBe(createdRiceType.price);
    expect(logNewValues.enable).toBe(createdRiceType.enable);
  });
});
