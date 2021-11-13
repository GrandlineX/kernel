import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { CoreCryptoClient } from '@grandlinex/core';
import { ICClient, IKernel } from '../../lib';
import { IAuthProvider, JwtToken } from '../../classes/BaseAuthProvider';
import { KernelDB } from '../../database';

export default class CryptoClient extends CoreCryptoClient implements ICClient {
  protected authProvider: IAuthProvider | null;

  protected kernel: IKernel;

  constructor(key: string, kernel: IKernel) {
    super(key);
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
    return jwt.sign(data, this.AesKey, { expiresIn: '1 days' });
  }

  async apiTokenValidation(
    username: string,
    token: string,
    requestType: string
  ): Promise<boolean> {
    if (this.authProvider) {
      return this.authProvider.authorizeToken(username, token, requestType);
    }
    const store = this.kernel.getConfigStore();
    if (!store.has('SERVER_PASSWORD')) {
      return false;
    }
    return token === store.get('SERVER_PASSWORD') && username === 'admin';
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
    if (this.authProvider) {
      return this.authProvider.bearerTokenValidation(req);
    }
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
}
