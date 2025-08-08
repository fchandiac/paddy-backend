import { Test, TestingModule } from '@nestjs/testing';
import { JweService } from '../../src/auth/jwe/jwe.service';

// Mock para la librería jose
const mockJose = {
  EncryptJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setIssuer: jest.fn().mockReturnThis(),
    setAudience: jest.fn().mockReturnThis(),
    encrypt: jest.fn().mockResolvedValue('mock.jwe.token'),
  })),
  jwtDecrypt: jest.fn().mockResolvedValue({
    payload: { sub: 1, email: 'test@test.com', role: 'admin' }
  }),
  importPKCS8: jest.fn().mockResolvedValue('mock-private-key'),
  importSPKI: jest.fn().mockResolvedValue('mock-public-key'),
};

jest.mock('jose', () => mockJose);

// Mock para fs
const mockFs = {
  readFileSync: jest.fn().mockReturnValue('mock-key-content')
};

jest.mock('fs', () => mockFs);

/**
 * Servicio JWE mock para tests
 */
export class MockJweService {
  async encrypt(payload: any, expiresIn: string = '15m'): Promise<string> {
    return `mock.jwe.token.${JSON.stringify(payload)}`;
  }

  async decrypt(token: string): Promise<any> {
    if (token.startsWith('mock.jwe.token.')) {
      const payloadStr = token.replace('mock.jwe.token.', '');
      return JSON.parse(payloadStr);
    }
    return { sub: 1, email: 'admin@ayg.cl', role: 'admin' };
  }

  async verify(token: string): Promise<boolean> {
    return token.startsWith('mock.jwe.token.') || token === 'valid-token';
  }
}

export const JweServiceProvider = {
  provide: JweService,
  useClass: MockJweService,
};
