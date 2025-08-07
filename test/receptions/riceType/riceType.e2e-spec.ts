import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

describe('RiceType CRUD + Auditoría (e2e)', () => {
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
  let updatedRiceType: any;

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
    
    // Ahora obtener los códigos y nombres ya usados
    const riceTypesRes = await request(httpServer)
      .get('/rice-types')
      .set('Authorization', `Bearer ${adminToken}`);
    usedCodes = (riceTypesRes.body || []).map((rt: any) => rt.code);
    usedNames = (riceTypesRes.body || []).map((rt: any) => rt.name);

    // Generar código y nombre únicos
    do {
      randomRiceCode = Math.floor(Math.random() * 1000000) + 1000;
      randomRiceName = 'TestArroz_' + Math.floor(Math.random() * 1000000);
    } while (usedCodes.includes(randomRiceCode) || usedNames.includes(randomRiceName));
  });

  it('Debe crear un tipo de arroz', async () => {
    const riceTypeDto = { code: randomRiceCode, name: randomRiceName, description: 'Arroz test', price: 123, enable: true };
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
    const logs = res.body.data || res.body;
    // Buscar el log más reciente que coincida con el entityId y acción
    const found = logs
      .filter((log) => log.entityId === createdRiceTypeId && log.action === 'CREATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (!found) {
      console.error('No se encontró log de auditoría para el tipo de arroz creado. Logs recibidos:', logs);
    }
    // ...existing code...
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
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

  // ===== READ TESTS =====
  it('Debe obtener el tipo de arroz por ID (READ)', async () => {
    const res = await request(httpServer)
      .get(`/rice-types/${createdRiceTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdRiceTypeId);
    expect(res.body.code).toBe(randomRiceCode);
    expect(res.body.name).toBe(randomRiceName);
    expect(res.body.enable).toBe(true);
  });

  it('Debe obtener todos los tipos de arroz (READ ALL)', async () => {
    const res = await request(httpServer)
      .get('/rice-types')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const foundRiceType = res.body.find((rt: any) => rt.id === createdRiceTypeId);
    expect(foundRiceType).toBeDefined();
  });

  // ===== UPDATE TESTS =====
  it('Debe actualizar el tipo de arroz (UPDATE)', async () => {
    const updateDto = {
      code: randomRiceCode, // Mantenemos el código
      name: `${randomRiceName}_UPDATED`,
      description: 'Arroz test actualizado',
      price: 456, // Entero ahora
      enable: false
    };
    
    const res = await request(httpServer)
      .put(`/rice-types/${createdRiceTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateDto);
    
    if (res.status !== 200) {
      console.error('Error al actualizar tipo de arroz:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdRiceTypeId);
    expect(res.body.name).toBe(updateDto.name);
    expect(res.body.price).toBe(updateDto.price);
    expect(res.body.enable).toBe(false);
    
    updatedRiceType = res.body;
  });

  it('Debe verificar que el tipo de arroz fue actualizado', async () => {
    const res = await request(httpServer)
      .get(`/rice-types/${createdRiceTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(`${randomRiceName}_UPDATED`);
    // Usar toBeCloseTo para comparaciones numéricas con tolerancia
    expect(res.body.price).toBe(456);
    expect(res.body.enable).toBe(false);
  });

  it('Debe verificar que existe un log de auditoría para la actualización', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=RICE_TYPE&action=UPDATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción UPDATE
    const found = logs
      .filter((log) => log.entityId === createdRiceTypeId && log.action === 'UPDATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría UPDATE. Logs recibidos:', logs);
    }
    
    // ...existing code...
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdRiceTypeId);
    expect(found.entityType).toBe('RICE_TYPE');
    expect(found.action).toBe('UPDATE');
    
    // Verificar que los newValues contienen los datos actualizados
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.name).toBe(`${randomRiceName}_UPDATED`);
    expect(logNewValues.price).toBe(456);
    expect(logNewValues.enable).toBe(false);
  });

  // ===== DELETE TESTS =====
  it('Debe eliminar el tipo de arroz (DELETE)', async () => {
    const res = await request(httpServer)
      .delete(`/rice-types/${createdRiceTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (res.status !== 200) {
      console.error('Error al eliminar tipo de arroz:', res.body);
    }
    expect(res.status).toBe(200);
  });

  it('Debe verificar que el tipo de arroz fue eliminado', async () => {
    const res = await request(httpServer)
      .get(`/rice-types/${createdRiceTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404); // Not found
  });

  it('Debe verificar que existe un log de auditoría para la eliminación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=RICE_TYPE&action=DELETE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción DELETE
    const found = logs
      .filter((log) => log.entityId === createdRiceTypeId && log.action === 'DELETE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría DELETE. Logs recibidos:', logs);
    }
    
    // ...existing code...
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdRiceTypeId);
    expect(found.entityType).toBe('RICE_TYPE');
    expect(found.action).toBe('DELETE');
  });
});
