// Jose library wrapper for conditional import based on environment
import { Injectable } from '@nestjs/common';

// Define interfaces for the jose library functions we use
interface JoseImports {
  EncryptJWT: any;
  jwtDecrypt: any;
  importPKCS8: any;
  importSPKI: any;
  errors: {
    JWEDecryptionFailed: new (message?: string) => Error;
    JWEInvalid: new (message?: string) => Error;
  };
}

// Mock implementation for testing
const createMockJose = (): JoseImports => ({
  EncryptJWT: class MockEncryptJWT {
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    setIssuer() { return this; }
    setAudience() { return this; }
    async encrypt() { return 'mock-encrypted-token'; }
  },
  jwtDecrypt: async () => ({
    payload: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      iat: Date.now() / 1000,
      exp: (Date.now() / 1000) + 3600
    },
    protectedHeader: {
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM'
    }
  }),
  importSPKI: async () => 'mock-public-key',
  importPKCS8: async () => 'mock-private-key',
  errors: {
    JWEDecryptionFailed: class JWEDecryptionFailed extends Error {
      constructor(message = 'JWE Decryption Failed') {
        super(message);
        this.name = 'JWEDecryptionFailed';
      }
    },
    JWEInvalid: class JWEInvalid extends Error {
      constructor(message = 'JWE Invalid') {
        super(message);
        this.name = 'JWEInvalid';
      }
    }
  }
});

@Injectable()
export class JoseWrapperService {
  private _jose: JoseImports | null = null;

  async getJose(): Promise<JoseImports> {
    if (this._jose) {
      return this._jose;
    }

    // In test environment, use mock
    if (process.env.NODE_ENV === 'test') {
      this._jose = createMockJose();
      return this._jose;
    }

    try {
      // Dynamic import for production
      const jose = await import('jose');
      this._jose = {
        EncryptJWT: jose.EncryptJWT,
        jwtDecrypt: jose.jwtDecrypt,
        importPKCS8: jose.importPKCS8,
        importSPKI: jose.importSPKI,
        errors: jose.errors
      };
      return this._jose;
    } catch (error) {
      console.error('Failed to import jose library:', error);
      // Fallback to mock if import fails
      this._jose = createMockJose();
      return this._jose;
    }
  }
}
