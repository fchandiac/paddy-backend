import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

describe('User CRUD + Auditoría (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;
  let adminToken: string;
  let createdUserId: number;
  let createdUser: any;
  let randomEmail: string;
  let randomName: string;
  let usedEmails: string[] = [];
  let usedNames: string[] = [];
  let updatedUser: any;

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
    
    // Ahora obtener los emails y nombres ya usados
    const usersRes = await request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    usedEmails = (usersRes.body || []).map((u: any) => u.email);
    usedNames = (usersRes.body || []).map((u: any) => u.name);

    // Generar email y nombre únicos
    do {
      const randomNum = Math.floor(Math.random() * 10000) + 1000;
      randomEmail = `testuser${randomNum}@test.com`;
      randomName = 'TestUser_' + Math.floor(Math.random() * 1000000);
    } while (usedEmails.includes(randomEmail) || usedNames.includes(randomName));
  });

  // ===== CREATE TESTS =====
  it('Debe crear un usuario', async () => {
    const userDto = {
      name: randomName,
      email: randomEmail,
      pass: 'testpass123',
      role: 'operador'
    };
    
    const res = await request(httpServer)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userDto);
    
    if (res.status !== 201) {
      console.error('Error al crear usuario:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(randomName);
    expect(res.body.email).toBe(randomEmail);
    expect(res.body.role).toBe('operador');
    // La contraseña no debe aparecer en la respuesta
    expect(res.body.pass).toBeUndefined();
    
    createdUserId = res.body.id;
    createdUser = res.body;
  });

  it('Debe verificar que el usuario fue creado', async () => {
    const res = await request(httpServer)
      .get(`/users/id/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(randomName);
    expect(res.body.email).toBe(randomEmail);
    expect(res.body.role).toBe('operador');
  });

  it('Debe verificar que existe un log de auditoría para la creación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=USER&action=CREATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción
    const found = logs
      .filter((log) => log.entityId === createdUserId && log.action === 'CREATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría para el usuario creado. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdUserId);
    expect(found.entityType).toBe('USER');
    expect(found.action).toBe('CREATE');
    
    // Comparar campos clave (usar newValues, no data)
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.name).toBe(createdUser.name);
    expect(logNewValues.email).toBe(createdUser.email);
    expect(logNewValues.role).toBe(createdUser.role);
    // La contraseña debe estar marcada como [REDACTED] en los logs
    expect(logNewValues.pass).toBe('[REDACTED]');
  });

  // ===== READ TESTS =====
  it('Debe obtener el usuario por ID (READ)', async () => {
    const res = await request(httpServer)
      .get(`/users/id/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.name).toBe(randomName);
    expect(res.body.email).toBe(randomEmail);
    expect(res.body.role).toBe('operador');
  });

  it('Debe obtener todos los usuarios (READ ALL)', async () => {
    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const foundUser = res.body.find((u: any) => u.id === createdUserId);
    expect(foundUser).toBeDefined();
  });

  it('Debe obtener usuario por email (READ BY EMAIL)', async () => {
    const res = await request(httpServer)
      .get(`/users/email/${randomEmail}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.email).toBe(randomEmail);
  });

  it('Debe obtener usuario por nombre (READ BY NAME)', async () => {
    const res = await request(httpServer)
      .get(`/users/name/${randomName}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const foundUser = res.body.find((u: any) => u.id === createdUserId);
    expect(foundUser).toBeDefined();
  });

  // ===== UPDATE TESTS =====
  it('Debe actualizar el usuario (UPDATE)', async () => {
    const updateDto = {
      id: createdUserId,
      name: `${randomName}_UPDATED`,
      email: randomEmail, // Mantenemos el email
      role: 'contador' // Cambiamos el rol
    };
    
    const res = await request(httpServer)
      .put('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateDto);
    
    if (res.status !== 200) {
      console.error('Error al actualizar usuario:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.name).toBe(updateDto.name);
    expect(res.body.email).toBe(updateDto.email);
    expect(res.body.role).toBe(updateDto.role);
    
    updatedUser = res.body;
  });

  it('Debe verificar que el usuario fue actualizado', async () => {
    const res = await request(httpServer)
      .get(`/users/id/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(`${randomName}_UPDATED`);
    expect(res.body.role).toBe('contador');
  });

  it('Debe verificar que existe un log de auditoría para la actualización', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=USER&action=UPDATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción UPDATE
    const found = logs
      .filter((log) => log.entityId === createdUserId && log.action === 'UPDATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría UPDATE. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdUserId);
    expect(found.entityType).toBe('USER');
    expect(found.action).toBe('UPDATE');
    
    // Verificar que los newValues contienen los datos actualizados
    const logNewValues = typeof found.newValues === 'string' ? JSON.parse(found.newValues) : found.newValues;
    expect(logNewValues.name).toBe(`${randomName}_UPDATED`);
    expect(logNewValues.role).toBe('contador');
  });

  // ===== PASSWORD UPDATE TEST =====
  it('Debe actualizar la contraseña del usuario', async () => {
    const passwordDto = {
      userId: createdUserId,
      newPassword: 'newpass456'
    };
    
    const res = await request(httpServer)
      .put('/users/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(passwordDto);
    
    if (res.status !== 200) {
      console.error('Error al actualizar contraseña:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('actualizada');
  });

  it('Debe verificar que existe un log de auditoría para el cambio de contraseña', async () => {
    // Esperamos un poco para que se procese el log
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const res = await request(httpServer)
      .get('/audit?entityType=USER&action=UPDATE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar logs de UPDATE para este usuario, ordenados por fecha
    const userUpdateLogs = logs
      .filter((log) => log.entityId === createdUserId && log.action === 'UPDATE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Debe haber al menos 1 log UPDATE para este usuario
    expect(userUpdateLogs.length).toBeGreaterThanOrEqual(1);
    
    // ...existing code...
    
    // El más reciente debería ser el cambio de contraseña
    const passwordUpdateLog = userUpdateLogs[0];
    expect(passwordUpdateLog.description).toContain('contraseña');
  });

  // ===== DELETE TESTS =====
  it('Debe eliminar el usuario (DELETE)', async () => {
    const res = await request(httpServer)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (res.status !== 200) {
      console.error('Error al eliminar usuario:', res.body);
    }
    expect(res.status).toBe(200);
  });

  it('Debe verificar que el usuario fue eliminado', async () => {
    const res = await request(httpServer)
      .get(`/users/id/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404); // Not found debido al soft delete
  });

  it('Debe verificar que existe un log de auditoría para la eliminación', async () => {
    const res = await request(httpServer)
      .get('/audit?entityType=USER&action=DELETE')
      .set('Authorization', `Bearer ${adminToken}`);
    const logs = res.body.data || res.body;
    
    // Buscar el log más reciente que coincida con el entityId y acción DELETE
    const found = logs
      .filter((log) => log.entityId === createdUserId && log.action === 'DELETE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!found) {
      console.error('No se encontró log de auditoría DELETE. Logs recibidos:', logs);
    }
    
    expect(found).toBeDefined();
    expect(found.userId).toBeDefined();
    expect(found.userId).not.toBeNull();
    expect(found.entityId).toBe(createdUserId);
    expect(found.entityType).toBe('USER');
    expect(found.action).toBe('DELETE');
  });
});
