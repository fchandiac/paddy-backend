// Mock implementation of jose library for Jest tests
const mockJose = {
  EncryptJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setIssuer: jest.fn().mockReturnThis(),
    setAudience: jest.fn().mockReturnThis(),
    encrypt: jest.fn().mockResolvedValue('mock-encrypted-token')
  })),
  
  jwtDecrypt: jest.fn().mockResolvedValue({
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
  
  importSPKI: jest.fn().mockResolvedValue('mock-public-key'),
  importPKCS8: jest.fn().mockResolvedValue('mock-private-key'),
  
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
};

module.exports = mockJose;
