import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

describe('Producer CRUD + Auditoría (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let adminToken: string;
  let createdProducerId: number;
  let createdProducerWithBankId: number;
  let createdProducer: any;
  let randomRut: string;
  let randomName: string;
  let usedRuts: string[] = [];
  let usedNames: string[] = [];
  let updatedProducer: any;

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
    
    // Ahora obtener los RUTs y nombres ya usados
    const producersRes = await request(httpServer)
      .get('/producers')
      .set('Authorization', `Bearer ${adminToken}`);
    usedRuts = (producersRes.body || []).map((p: any) => p.rut);
    usedNames = (producersRes.body || []).map((p: any) => p.name);

    // Generar RUT y nombre únicos
    do {
      const randomNum = Math.floor(Math.random() * 10000000) + 10000000; // 8 dígitos
      const dv = Math.floor(Math.random() * 10); // Dígito verificador
      randomRut = `${randomNum}-${dv}`;
      randomName = 'TestProductor_' + Math.floor(Math.random() * 1000000);
    } while (usedRuts.includes(randomRut) || usedNames.includes(randomName));
  });

  // ===== CREATE TESTS =====
  it('Debe crear un productor', async () => {
    const producerDto = {
      name: randomName,
      businessName: `${randomName} SpA`,
      rut: randomRut,
      address: 'Calle Test 123',
      phone: '+56912345678'
    };
    
    const res = await request(httpServer)
      .post('/producers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(producerDto);
    
    if (res.status !== 201) {
      console.error('Error al crear productor:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(randomName);
    expect(res.body.rut).toBe(randomRut);
    
    createdProducerId = res.body.id;
    createdProducer = res.body;
  });

  it('Debe verificar que el productor fue creado', async () => {
    const res = await request(httpServer)
      .get(`/producers/${createdProducerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(randomName);
    expect(res.body.rut).toBe(randomRut);
  });

  it('Debe verificar que existe un log de auditoría para la creación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=PRODUCER&action=CREATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción
    const found = logs
      .filter((log) => log.entityId === createdProducerId && log.action === 'CREATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría para el productor creado. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdProducerId);
    expect(found.entityType).toBe('PRODUCER');
    expect(found.action).toBe('CREATE');
    
    // Comparar campos clave (usar newValues, no data)
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.name).toBe(createdProducer.name);
    expect(logNewValues.rut).toBe(createdProducer.rut);
    expect(logNewValues.businessName).toBe(createdProducer.businessName);
    expect(logNewValues.address).toBe(createdProducer.address);
    expect(logNewValues.phone).toBe(createdProducer.phone);
  });

  // ===== READ TESTS =====
  it('Debe obtener el productor por ID (READ)', async () => {
    const res = await request(httpServer)
      .get(`/producers/${createdProducerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdProducerId);
    expect(res.body.name).toBe(randomName);
    expect(res.body.rut).toBe(randomRut);
  });

  it('Debe obtener todos los productores (READ ALL)', async () => {
    const res = await request(httpServer)
      .get('/producers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const foundProducer = res.body.find((p: any) => p.id === createdProducerId);
    expect(foundProducer).toBeDefined();
  });

  // ===== UPDATE TESTS =====
  it('Debe actualizar el productor (UPDATE)', async () => {
    const updateDto = {
      name: `${randomName}_UPDATED`,
      businessName: `${randomName}_UPDATED SpA`,
      rut: randomRut, // Mantenemos el RUT
      address: 'Calle Actualizada 456',
      phone: '+56987654321'
    };
    
    const res = await request(httpServer)
      .put(`/producers/${createdProducerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateDto);
    
    if (res.status !== 200) {
      console.error('Error al actualizar productor:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdProducerId);
    expect(res.body.name).toBe(updateDto.name);
    expect(res.body.businessName).toBe(updateDto.businessName);
    expect(res.body.address).toBe(updateDto.address);
    expect(res.body.phone).toBe(updateDto.phone);
    
    updatedProducer = res.body;
  });

  it('Debe verificar que el productor fue actualizado', async () => {
    const res = await request(httpServer)
      .get(`/producers/${createdProducerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(`${randomName}_UPDATED`);
    expect(res.body.businessName).toBe(`${randomName}_UPDATED SpA`);
    expect(res.body.address).toBe('Calle Actualizada 456');
    expect(res.body.phone).toBe('+56987654321');
  });

  it('Debe verificar que existe un log de auditoría para la actualización', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=PRODUCER&action=UPDATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción UPDATE
    const found = logs
      .filter((log) => log.entityId === createdProducerId && log.action === 'UPDATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría UPDATE. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdProducerId);
    expect(found.entityType).toBe('PRODUCER');
    expect(found.action).toBe('UPDATE');
    
    // Verificar que los newValues contienen los datos actualizados
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.name).toBe(`${randomName}_UPDATED`);
    expect(logNewValues.businessName).toBe(`${randomName}_UPDATED SpA`);
    expect(logNewValues.address).toBe('Calle Actualizada 456');
    expect(logNewValues.phone).toBe('+56987654321');
  });

  // ===== BANK ACCOUNT TESTS =====
  it('Debe obtener la lista de bancos disponibles', async () => {
    const res = await request(httpServer)
      .get('/producers/banks')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Verificar estructura de cada banco
    const bank = res.body[0];
    expect(bank).toHaveProperty('code');
    expect(bank).toHaveProperty('name');
    expect(typeof bank.code).toBe('number');
    expect(typeof bank.name).toBe('string');
  });

  it('Debe obtener la lista de tipos de cuenta disponibles', async () => {
    const res = await request(httpServer)
      .get('/producers/account-types')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Verificar estructura de cada tipo de cuenta
    const accountType = res.body[0];
    expect(accountType).toHaveProperty('code');
    expect(accountType).toHaveProperty('name');
    expect(typeof accountType.code).toBe('number');
    expect(typeof accountType.name).toBe('string');
  });

  it('Debe crear un productor con cuenta bancaria', async () => {
    // Generar un RUT único diferente para este test
    let uniqueRut: string;
    do {
      const randomNum = Math.floor(Math.random() * 10000000) + 10000000; // 8 dígitos
      const dv = Math.floor(Math.random() * 10); // Dígito verificador
      uniqueRut = `${randomNum}-${dv}`;
    } while (usedRuts.includes(uniqueRut));

    const createProducerWithBankDto = {
      name: `${randomName}_WITH_BANK`,
      businessName: `${randomName}_WITH_BANK SpA`,
      rut: uniqueRut, // Usar el RUT único generado
      address: 'Dirección con Banco 123',
      phone: '+56900000000',
      bankCode: 100, // Banco de Chile
      accountNumber: '123456789',
      accountTypeCode: 101, // Cuenta Corriente
      holderName: `${randomName}_WITH_BANK`
    };

    const res = await request(httpServer)
      .post('/producers/with-bank')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createProducerWithBankDto);

    if (res.status !== 201) {
      console.error('Error al crear productor con banco:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe(createProducerWithBankDto.name);
    expect(res.body.bankAccounts).toBeDefined();
    expect(Array.isArray(res.body.bankAccounts)).toBe(true);
    expect(res.body.bankAccounts.length).toBe(1);
    
    const bankAccount = res.body.bankAccounts[0];
    expect(bankAccount.bankCode).toBe(100);
    expect(bankAccount.bankName).toBe('Banco de Chile');
    expect(bankAccount.accountTypeCode).toBe(101);
    expect(bankAccount.accountTypeName).toBe('Cuenta Corriente');
    expect(bankAccount.accountNumber).toBe('123456789');
    expect(bankAccount.holderName).toBe(createProducerWithBankDto.holderName);

    // Guardar ID para uso posterior
    createdProducerWithBankId = res.body.id;
  });

  it('Debe agregar una cuenta bancaria adicional al productor', async () => {
    const addBankAccountDto = {
      bankCode: 102, // Banco Santander
      accountNumber: '987654321',
      accountTypeCode: 102, // Cuenta de Ahorro
      holderName: 'Titular Adicional'
    };

    const res = await request(httpServer)
      .patch(`/producers/${createdProducerId}/add-bank-account`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(addBankAccountDto);

    if (res.status !== 200) {
      console.error('Error al agregar cuenta bancaria:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.bankAccounts).toBeDefined();
    expect(Array.isArray(res.body.bankAccounts)).toBe(true);
    expect(res.body.bankAccounts.length).toBe(1);
    
    const bankAccount = res.body.bankAccounts[0];
    expect(bankAccount.bankCode).toBe(102);
    expect(bankAccount.bankName).toBe('Banco Santander Chile');
    expect(bankAccount.accountTypeCode).toBe(102);
    expect(bankAccount.accountTypeName).toBe('Cuenta de Ahorro');
    expect(bankAccount.accountNumber).toBe('987654321');
    expect(bankAccount.holderName).toBe('Titular Adicional');
  });

  // ===== DELETE TESTS =====
  it('Debe eliminar el productor (DELETE)', async () => {
    // Verificar que el ID esté definido
    expect(createdProducerId).toBeDefined();
    expect(typeof createdProducerId).toBe('number');
    expect(createdProducerId).toBeGreaterThan(0);

    const res = await request(httpServer)
      .delete(`/producers/${createdProducerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (res.status !== 200) {
      console.error('Error al eliminar productor:', res.body);
      console.error('ID utilizado:', createdProducerId);
    }
    expect(res.status).toBe(200);
  });

  it('Debe eliminar el productor con banco (DELETE)', async () => {
    // Verificar que el ID esté definido
    expect(createdProducerWithBankId).toBeDefined();
    expect(typeof createdProducerWithBankId).toBe('number');
    expect(createdProducerWithBankId).toBeGreaterThan(0);

    const res = await request(httpServer)
      .delete(`/producers/${createdProducerWithBankId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (res.status !== 200) {
      console.error('Error al eliminar productor con banco:', res.body);
      console.error('ID utilizado:', createdProducerWithBankId);
    }
    expect(res.status).toBe(200);
  });

  it('Debe verificar que el productor fue eliminado', async () => {
    const res = await request(httpServer)
      .get(`/producers/${createdProducerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404); // Not found debido al soft delete
  });

  it('Debe verificar que existe un log de auditoría para la eliminación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=PRODUCER&action=DELETE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción DELETE
    const found = logs
      .filter((log) => log.entityId === createdProducerId && log.action === 'DELETE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría DELETE. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdProducerId);
    expect(found.entityType).toBe('PRODUCER');
    expect(found.action).toBe('DELETE');
  });
});
