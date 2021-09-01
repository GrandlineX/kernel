import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { randomBytes } from 'crypto';
import { ICClient, IKernel } from '../../lib';
import { IAuthProvider, JwtToken } from '../../classes/BaseAuthProvider';
import { KernelDB } from '../../database';

const encryptionType = 'aes-256-gcm';
const encryptionEncoding = 'base64';
const bufferEncryption = 'utf8';

export default class CryptoClient implements ICClient {
  private AesKey: string;

  private AesIV: string;

  private authProvider: IAuthProvider | null;

  private kernel: IKernel;

  constructor(key: string, kernel: IKernel) {
    if (key.length !== 32) {
      throw new Error('INVALID KEY LENGTH');
    }
    this.AesKey = key;
    this.AesIV = key.substring(0, 16);
    this.kernel = kernel;
    this.authProvider = null;
  }

  setAuthProvider(provider: IAuthProvider): boolean {
    if (this.authProvider) {
      return false;
    }
    this.authProvider = provider;
    return true;
  }

  generateSecureToken(length: number): Promise<string> {
    return new Promise<string>((resolve) => {
      randomBytes(length, (err, buf) => {
        if (err) {
          resolve('');
        } else {
          resolve(buf.toString('hex'));
        }
      });
    });
  }

  encrypt(message: string): {
    auth: Buffer;
    iv: Buffer;
    enc: string;
  } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(encryptionType, this.AesKey, iv);

    let enc = cipher.update(message, bufferEncryption, encryptionEncoding);
    enc += cipher.final(encryptionEncoding);
    return {
      auth: cipher.getAuthTag(),
      iv,
      enc,
    };
  }

  decrypt(enc: string, iv: Buffer, authTag: Buffer): string {
    const decipher = crypto.createDecipheriv(encryptionType, this.AesKey, iv);
    decipher.setAuthTag(Buffer.from(authTag));
    let str = decipher.update(enc, encryptionEncoding, bufferEncryption);
    str += decipher.final(bufferEncryption);
    return str;
  }

  isValid(): boolean {
    return this.AesKey.length === 32;
  }

  getHash(seed: string, val: string): string {
    return crypto
      .createHash('sha512')
      .update(seed + val)
      .digest('hex');
  }

  jwtVerifyAccessToken(token: string): Promise<JwtToken | null> {
    return new Promise((resolve) => {
      jwt.verify(token, this.AesKey, (err: any, user: any) => {
        if (err || user === null) {
          resolve(null);
        } else {
          resolve(user);
        }
      });
    });
  }

  jwtGenerateAccessToken(data: { username: string }): string {
    return jwt.sign(data, this.AesKey, { expiresIn: '14400s' });
  }

  async apiTokenValidation(
    username: string,
    token: string,
    requestType: string
  ): Promise<boolean> {
    if (this.authProvider) {
      return this.authProvider.authorizeToken(username, token, requestType);
    }
    return token === process.env.SERVER_PASSWOR && username === 'admin';
  }

  async permissonValidation(
    token: JwtToken,
    requestType: string
  ): Promise<boolean> {
    if (this.authProvider) {
      return this.authProvider.validateAcces(token, requestType);
    }
    return false;
  }

  async bearerTokenValidation(req: Request): Promise<JwtToken | null> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      return null;
    }
    const tokenData = await this.jwtVerifyAccessToken(token);
    if (tokenData) {
      return tokenData;
    }
    return null;
  }

  async keyStoreSave(data: string): Promise<number> {
    const db = this.kernel.getDb() as KernelDB;
    const keyCrypt = this.encrypt(data);
    return db.setKey(keyCrypt.enc, keyCrypt.iv, keyCrypt.auth);
  }

  async keyStoreLoad(id: number): Promise<string | null> {
    const db = this.kernel.getDb() as KernelDB;
    const key = await db.getKey(id);
    return this.decrypt(key.secret, key.iv, key.auth);
  }

  static fromPW(pw: string, kernel: IKernel): ICClient {
    const shasum = crypto.createHash('sha512').update(pw).digest('hex');
    return new CryptoClient(shasum.substring(0, 32), kernel);
  }
}
