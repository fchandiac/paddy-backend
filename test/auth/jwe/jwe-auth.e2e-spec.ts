import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Auth JWE (e2e)', () => {
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

  it('Debe hacer login y retornar un token JWE', async () => {
    const res = await request(httpServer)
      .post('/auth/sign-in')
      .send({
        email: 'admin@ayg.cl',
        pass: 'admin'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.userId).toBeDefined();
    expect(res.body.email).toBe('admin@ayg.cl');
    expect(res.body.role).toBeDefined();
    
    // El token debe ser un string (JWE)
    expect(typeof res.body.access_token).toBe('string');
    expect(res.body.access_token.length).toBeGreaterThan(0);
  });

  it('Debe usar el token JWE para acceder a endpoints protegidos', async () => {
    // Primero hacer login
    const loginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({
        email: 'admin@ayg.cl',
        pass: 'admin'
      });
    
    const token = loginRes.body.access_token;
    
    // Usar el token para acceder a un endpoint protegido
    const res = await request(httpServer)
      .get('/receptions/health')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
  });

  it('Debe rechazar tokens inválidos', async () => {
    const res = await request(httpServer)
      .get('/receptions/health')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(res.status).toBe(401);
  });

  it('Debe rechazar requests sin token', async () => {
    const res = await request(httpServer)
      .get('/receptions/health');
    
    expect(res.status).toBe(401);
  });
});
