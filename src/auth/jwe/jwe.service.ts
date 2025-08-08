import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { envs } from '../../../libs/config/envs';
import { JoseWrapperService } from './jose-wrapper.service';

@Injectable()
export class JweService {
  private privateKey: any;
  private publicKey: any;

  constructor(private readonly joseWrapper: JoseWrapperService) {
    this.loadKeys();
  }

  private async loadKeys() {
    try {
      const jose = await this.joseWrapper.getJose();
      const privateKeyPem = readFileSync(envs.jwe.privateKeyPath, 'utf8');
      const publicKeyPem = readFileSync(envs.jwe.publicKeyPath, 'utf8');
      
      this.privateKey = await jose.importPKCS8(privateKeyPem, 'RSA-OAEP-256');
      this.publicKey = await jose.importSPKI(publicKeyPem, 'RSA-OAEP-256');
    } catch (error) {
      throw new Error(`Error loading JWE keys: ${error.message}`);
    }
  }

  /**
   * Cifra un payload y crea un token JWE
   * @param payload - Los datos a cifrar
   * @param expiresIn - Tiempo de expiración (ej: '15m', '1h')
   * @returns Token JWE cifrado
   */
  async encrypt(payload: any, expiresIn: string = '15m'): Promise<string> {
    const jose = await this.joseWrapper.getJose();
    const jwt = await new jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setIssuer('paddy-backend')
      .setAudience('paddy-frontend')
      .encrypt(this.publicKey);

    return jwt;
  }

  /**
   * Descifra un token JWE y extrae el payload
   * @param token - Token JWE a descifrar
   * @returns Payload descifrado
   */
  async decrypt(token: string): Promise<any> {
    try {
      const jose = await this.joseWrapper.getJose();
      const { payload } = await jose.jwtDecrypt(token, this.privateKey, {
        issuer: 'paddy-backend',
        audience: 'paddy-frontend',
      });

      return payload;
    } catch (error) {
      throw new Error(`Invalid or expired token: ${error.message}`);
    }
  }

  /**
   * Verifica si un token es válido sin extraer el payload
   * @param token - Token JWE a verificar
   * @returns true si es válido, false si no
   */
  async verify(token: string): Promise<boolean> {
    try {
      await this.decrypt(token);
      return true;
    } catch {
      return false;
    }
  }
}
