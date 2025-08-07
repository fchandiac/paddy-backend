import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

describe('DiscountPercent CRUD + Auditoría (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let adminToken: string;
  let createdDiscountId: number;
  let createdDiscount: any;
  let randomDiscountCode: number;
  let usedDiscountCodes: number[] = [];
  let updatedDiscount: any;

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
    
    // Ahora obtener los códigos de descuento ya usados
    const discountsRes = await request(httpServer)
      .get('/discounts-percent')
      .set('Authorization', `Bearer ${adminToken}`);
    usedDiscountCodes = (discountsRes.body || []).map((d: any) => d.discountCode);

    // Generar código de descuento único
    do {
      randomDiscountCode = Math.floor(Math.random() * 1000) + 1;
    } while (usedDiscountCodes.includes(randomDiscountCode));
  });

  // ===== CREATE TESTS =====
  it('Debe crear un porcentaje de descuento', async () => {
    const discountDto = {
      discountCode: randomDiscountCode,
      start: 0,
      end: 10,
      percent: 5.5
    };
    
    const res = await request(httpServer)
      .post('/discounts-percent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(discountDto);
    
    if (res.status !== 201) {
      console.error('Error al crear porcentaje de descuento:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.discountCode).toBe(randomDiscountCode);
    expect(parseFloat(res.body.start)).toBe(0);
    expect(parseFloat(res.body.end)).toBe(10);
    expect(parseFloat(res.body.percent)).toBe(5.5);
    
    createdDiscountId = res.body.id;
    createdDiscount = res.body;
  });

  it('Debe verificar que el porcentaje de descuento fue creado', async () => {
    const res = await request(httpServer)
      .get(`/discounts-percent/${createdDiscountId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.discountCode).toBe(randomDiscountCode);
    expect(parseFloat(res.body.start)).toBe(0);
    expect(parseFloat(res.body.end)).toBe(10);
    expect(parseFloat(res.body.percent)).toBe(5.5);
  });

  it('Debe verificar que existe un log de auditoría para la creación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=DISCOUNT_PERCENT&action=CREATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción
    const found = logs
      .filter((log) => log.entityId === createdDiscountId && log.action === 'CREATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría para el descuento creado. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdDiscountId);
    expect(found.entityType).toBe('DISCOUNT_PERCENT');
    expect(found.action).toBe('CREATE');
    
    // Comparar campos clave (usar newValues, no data)
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.discountCode).toBe(createdDiscount.discountCode);
    expect(parseFloat(logNewValues.start)).toBe(0);
    expect(parseFloat(logNewValues.end)).toBe(10);
    expect(parseFloat(logNewValues.percent)).toBe(5.5);
  });

  // ===== READ TESTS =====
  it('Debe obtener el porcentaje de descuento por ID (READ)', async () => {
    const res = await request(httpServer)
      .get(`/discounts-percent/${createdDiscountId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdDiscountId);
    expect(res.body.discountCode).toBe(randomDiscountCode);
    expect(parseFloat(res.body.percent)).toBe(5.5);
  });

  it('Debe obtener todos los porcentajes de descuento (READ ALL)', async () => {
    const res = await request(httpServer)
      .get('/discounts-percent')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const foundDiscount = res.body.find((d: any) => d.id === createdDiscountId);
    expect(foundDiscount).toBeDefined();
  });

  it('Debe obtener porcentajes de descuento por código (READ BY CODE)', async () => {
    const res = await request(httpServer)
      .get(`/discounts-percent/code/${randomDiscountCode}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const foundDiscount = res.body.find((d: any) => d.id === createdDiscountId);
    expect(foundDiscount).toBeDefined();
  });

  // ===== UPDATE TESTS =====
  it('Debe actualizar el porcentaje de descuento (UPDATE)', async () => {
    const updateDto = {
      discountCode: randomDiscountCode, // Mantenemos el código
      start: 5,
      end: 15,
      percent: 8.75
    };
    
    const res = await request(httpServer)
      .put(`/discounts-percent/${createdDiscountId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateDto);
    
    if (res.status !== 200) {
      console.error('Error al actualizar porcentaje de descuento:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdDiscountId);
    expect(res.body.discountCode).toBe(randomDiscountCode);
    expect(parseFloat(res.body.start)).toBe(5);
    expect(parseFloat(res.body.end)).toBe(15);
    expect(parseFloat(res.body.percent)).toBe(8.75);
    
    updatedDiscount = res.body;
  });

  it('Debe verificar que el porcentaje de descuento fue actualizado', async () => {
    const res = await request(httpServer)
      .get(`/discounts-percent/${createdDiscountId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(parseFloat(res.body.start)).toBe(5);
    expect(parseFloat(res.body.end)).toBe(15);
    expect(parseFloat(res.body.percent)).toBe(8.75);
  });

  it('Debe verificar que existe un log de auditoría para la actualización', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=DISCOUNT_PERCENT&action=UPDATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción UPDATE
    const found = logs
      .filter((log) => log.entityId === createdDiscountId && log.action === 'UPDATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría UPDATE. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdDiscountId);
    expect(found.entityType).toBe('DISCOUNT_PERCENT');
    expect(found.action).toBe('UPDATE');
    
    // Verificar que los newValues contienen los datos actualizados
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(parseFloat(logNewValues.start)).toBe(5);
    expect(parseFloat(logNewValues.end)).toBe(15);
    expect(parseFloat(logNewValues.percent)).toBe(8.75);
  });

  // ===== DELETE TESTS =====
  it('Debe eliminar el porcentaje de descuento (DELETE)', async () => {
    const res = await request(httpServer)
      .delete(`/discounts-percent/${createdDiscountId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (res.status !== 200) {
      console.error('Error al eliminar porcentaje de descuento:', res.body);
    }
    expect(res.status).toBe(200);
  });

  it('Debe verificar que el porcentaje de descuento fue eliminado', async () => {
    const res = await request(httpServer)
      .get(`/discounts-percent/${createdDiscountId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404); // Not found debido al soft delete
  });

  it('Debe verificar que existe un log de auditoría para la eliminación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=DISCOUNT_PERCENT&action=DELETE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción DELETE
    const found = logs
      .filter((log) => log.entityId === createdDiscountId && log.action === 'DELETE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría DELETE. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdDiscountId);
    expect(found.entityType).toBe('DISCOUNT_PERCENT');
    expect(found.action).toBe('DELETE');
  });

  // ===== TEST PARA SECADO (discountCode=8) =====
  it('Debe validar rangos de Secado (discountCode 8)', async () => {
      const code = 8;
      const expectedRanges = [
        { start: 15.01, end: 17.0, percent: 1.5 },
        { start: 17.01, end: 20.0, percent: 2.5 },
        { start: 20.01, end: 22.5, percent: 3.5 },
        { start: 22.51, end: 100.0, percent: 4.5 },
      ];
    // Obtener rangos existentes para evitar conflictos
    const existingRes = await request(httpServer)
      .get(`/discounts-percent/code/${code}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(existingRes.status).toBe(200);
    const existingRanges = existingRes.body as Array<any>;
    const toCreate = expectedRanges.filter(er =>
      !existingRanges.some(ex =>
        parseFloat(ex.start) === er.start &&
        parseFloat(ex.end) === er.end &&
        parseFloat(ex.percent) === er.percent
      )
    );
    // Crear rangos faltantes
    for (const range of toCreate) {
      const createRes = await request(httpServer)
        .post('/discounts-percent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ discountCode: code, start: range.start, end: range.end, percent: range.percent });
      expect(createRes.status).toBe(201);
    }
    // Obtener todos los rangos y verificar
    const getRes = await request(httpServer)
      .get(`/discounts-percent/code/${code}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBe(expectedRanges.length);
    expectedRanges.forEach((range, index) => {
      const item = getRes.body[index];
      expect(parseFloat(item.start)).toBeCloseTo(range.start, 2);
      expect(parseFloat(item.end)).toBeCloseTo(range.end, 2);
      expect(parseFloat(item.percent)).toBeCloseTo(range.percent, 2);
    });
  });
});
