import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

/**
 * Configuración común para tests E2E con JWE
 */
export class TestHelper {
  static async createApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  }

  static async getAdminToken(app: INestApplication): Promise<string> {
    const httpServer = app.getHttpServer();
    const request = require('supertest');
    
    const loginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({ email: 'admin@ayg.cl', pass: 'admin' });
    
    if (loginRes.status !== 201) {
      throw new Error(`Login failed: ${loginRes.status} - ${JSON.stringify(loginRes.body)}`);
    }
    
    return loginRes.body.access_token;
  }

  static async getAdminData(app: INestApplication): Promise<{ token: string; userId: number }> {
    const httpServer = app.getHttpServer();
    const request = require('supertest');
    
    const loginRes = await request(httpServer)
      .post('/auth/sign-in')
      .send({ email: 'admin@ayg.cl', pass: 'admin' });
    
    if (loginRes.status !== 201) {
      throw new Error(`Login failed: ${loginRes.status} - ${JSON.stringify(loginRes.body)}`);
    }
    
    return {
      token: loginRes.body.access_token,
      userId: loginRes.body.userId,
    };
  }
}
