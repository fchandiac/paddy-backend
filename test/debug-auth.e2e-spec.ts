import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../libs/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Debug Auth (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    // Create test admin user
    const existingUser = await userRepository.findOne({ where: { email: 'admin@ayg.cl' } });
    if (!existingUser) {
      await userRepository.save({
        email: 'admin@ayg.cl',
        pass: 'admin',
        name: 'Test Admin',
        role: 'admin',
        isActive: true
      });
      console.log('Test admin user created');
    } else {
      console.log('Test admin user already exists');
    }
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should debug login request', async () => {
    console.log('Making login request...');
    
    const res = await request(httpServer)
      .post('/auth/sign-in')
      .send({
        email: 'admin@ayg.cl',
        pass: 'admin'
      });
    
    console.log('Response status:', res.status);
    console.log('Response body:', res.body);
    
    // Now let's check if it's working
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.email).toBe('admin@ayg.cl');
  });

  it('Should test health endpoint', async () => {
    const res = await request(httpServer)
      .get('/auth/health');
    
    expect(res.status).toBe(200);
  });
});
