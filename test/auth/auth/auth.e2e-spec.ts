import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Auth + Auditoría (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // ===== HEALTH CHECK TEST =====
  it('Debe verificar salud del servicio de autenticación', async () => {
    const res = await request(httpServer)
      .get('/auth/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Auth service is running');
  });

  it('Debe verificar que existe un log de auditoría para health check', async () => {
    await request(httpServer).get('/auth/health');
    
    // Esperamos un poco para que se procese el log
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Obtenemos un token de admin para consultar logs
    const loginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({
        email: 'admin@ayg.cl',
        pass: 'admin'
      });
    
    const adminToken = loginRes.body.access_token;
    
    const res = await request(httpServer)
      .get('/audit?entityType=SYSTEM&action=VIEW')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const logs = res.body.data || res.body;
    const found = logs.find((log: any) => 
      log.entityType === 'SYSTEM' && 
      log.action === 'VIEW' && 
      log.description.includes('salud del servicio de autenticación')
    );
    
    expect(found).toBeDefined();
    expect(found.entityType).toBe('SYSTEM');
    expect(found.action).toBe('VIEW');
    expect(found.success).toBe(true);
  });

  // ===== LOGIN EXITOSO TEST =====
  it('Debe hacer login exitoso y generar log de auditoría', async () => {
    const loginDto = {
      email: 'admin@ayg.cl',
      pass: 'admin'
    };
    
    const res = await request(httpServer)
      .post('/auth/sign-in')
      .send(loginDto);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('userId');
    expect(res.body.email).toBe('admin@ayg.cl');
    expect(res.body.role).toBe('admin');
    
    // Verificar que el log de auditoría se creó
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const adminToken = res.body.access_token;
    const auditRes = await request(httpServer)
      .get('/audit?entityType=USER&action=LOGIN')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const logs = auditRes.body.data || auditRes.body;
    
    // Buscar el log más reciente que coincida con nuestro login exitoso
    const found = logs.find((log: any) => 
      log.entityType === 'USER' && 
      log.action === 'LOGIN' && 
      log.entityId === res.body.userId &&
      log.success === true &&
      log.description.includes('Login exitoso para admin@ayg.cl')
    );
    
    expect(found).toBeDefined();
    expect(found.entityType).toBe('USER');
    expect(found.action).toBe('LOGIN');
    expect(found.entityId).toBe(res.body.userId);
    expect(found.success).toBe(true);
    expect(found.newValues.email).toBe('admin@ayg.cl');
    expect(found.newValues.loginSuccessful).toBe(true);
    expect(found.newValues.loginResult).toBe('SUCCESS');
    expect(found.newValues.failureReason).toBeNull();
    expect(found.description).toContain('Login exitoso para admin@ayg.cl');
    
    console.log('Log de auditoría LOGIN exitoso:', {
      entityId: found.entityId,
      userId: found.userId,
      action: found.action,
      entityType: found.entityType,
      success: found.success,
      email: found.newValues.email,
      loginResult: found.newValues.loginResult,
      description: found.description,
      createdAt: found.createdAt
    });
  });

  // ===== LOGIN FALLIDO TEST =====
  it('Debe generar log de auditoría para login fallido', async () => {
    const loginDto = {
      email: 'admin@ayg.cl',
      pass: 'contraseña_incorrecta'
    };
    
    const res = await request(httpServer)
      .post('/auth/sign-in')
      .send(loginDto);
    
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Contraseña incorrecta');
    
    // Obtenemos un token válido para consultar logs
    const validLoginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({
        email: 'admin@ayg.cl',
        pass: 'admin'
      });
    
    const adminToken = validLoginRes.body.access_token;
    
    // Esperamos un poco para que se procese el log
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const auditRes = await request(httpServer)
      .get('/audit?entityType=USER&action=LOGIN')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const logs = auditRes.body.data || auditRes.body;
    const found = logs.find((log: any) => 
      log.entityType === 'USER' && 
      log.action === 'LOGIN' && 
      log.success === false &&
      log.description.includes('Login fallido para admin@ayg.cl')
    );
    
    expect(found).toBeDefined();
    expect(found.entityType).toBe('USER');
    expect(found.action).toBe('LOGIN');
    expect(found.success).toBe(false);
    expect(found.newValues.email).toBe('admin@ayg.cl');
    expect(found.newValues.loginSuccessful).toBe(false);
    expect(found.newValues.loginResult).toBe('FAILED');
    expect(found.newValues.failureReason).toContain('Contraseña incorrecta');
    expect(found.description).toContain('Login fallido para admin@ayg.cl');
    expect(found.errorMessage).toContain('Contraseña incorrecta');
    
    console.log('Log de auditoría LOGIN fallido:', {
      entityId: found.entityId,
      userId: found.userId,
      action: found.action,
      entityType: found.entityType,
      success: found.success,
      email: found.newValues.email,
      loginResult: found.newValues.loginResult,
      failureReason: found.newValues.failureReason,
      description: found.description,
      errorMessage: found.errorMessage,
      createdAt: found.createdAt
    });
  });

  // ===== LOGIN CON USUARIO INEXISTENTE TEST =====
  it('Debe generar log de auditoría para usuario inexistente', async () => {
    const loginDto = {
      email: 'usuario_inexistente@test.com',
      pass: 'cualquier_contraseña'
    };
    
    const res = await request(httpServer)
      .post('/auth/sign-in')
      .send(loginDto);
    
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Usuario no encontrado');
    
    // Obtenemos un token válido para consultar logs
    const validLoginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({
        email: 'admin@ayg.cl',
        pass: 'admin'
      });
    
    const adminToken = validLoginRes.body.access_token;
    
    // Esperamos un poco para que se procese el log
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const auditRes = await request(httpServer)
      .get('/audit?entityType=USER&action=LOGIN')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const logs = auditRes.body.data || auditRes.body;
    const found = logs.find((log: any) => 
      log.entityType === 'USER' && 
      log.action === 'LOGIN' && 
      log.success === false &&
      log.newValues.email === 'usuario_inexistente@test.com'
    );
    
    expect(found).toBeDefined();
    expect(found.entityType).toBe('USER');
    expect(found.action).toBe('LOGIN');
    expect(found.success).toBe(false);
    expect(found.newValues.email).toBe('usuario_inexistente@test.com');
    expect(found.newValues.loginSuccessful).toBe(false);
    expect(found.newValues.loginResult).toBe('FAILED');
    expect(found.newValues.failureReason).toContain('Usuario no encontrado');
    expect(found.description).toContain('Login fallido para usuario_inexistente@test.com');
    expect(found.errorMessage).toContain('Usuario no encontrado');
    
    console.log('Log de auditoría LOGIN usuario inexistente:', {
      entityId: found.entityId,
      userId: found.userId,
      action: found.action,
      entityType: found.entityType,
      success: found.success,
      email: found.newValues.email,
      loginResult: found.newValues.loginResult,
      failureReason: found.newValues.failureReason,
      description: found.description,
      errorMessage: found.errorMessage,
      createdAt: found.createdAt
    });
  });
});
