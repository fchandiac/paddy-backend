import { config } from 'dotenv';

// Load environment variables for tests
config({ path: '.env.test' });

// Test setup file for Jest
// This file is run after the testing framework has been set up but before the test files

// Global test configuration
jest.setTimeout(10000); // 10 seconds timeout for all tests

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWE_PRIVATE_KEY_PATH = './test/mocks/test-private.pem';
process.env.JWE_PUBLIC_KEY_PATH = './test/mocks/test-public.pem';

// Global test utilities
(global as any).mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

(global as any).mockJwePayload = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};