import jwt from 'jsonwebtoken';
import { CoreCryptoClient } from '@grandlinex/core';
import { ICClient, IKernel } from '../../lib';
import {
  IAuthProvider,
  JwtToken,
  JwtTokenData,
} from '../../classes/BaseAuthProvider';
import { XRequest } from '../../lib/express';

export default class CryptoClient extends CoreCryptoClient implements ICClient {
  protected authProvider: IAuthProvider | null;

  protected kernel: IKernel;

  protected expiresIn: string;

  constructor(key: string, kernel: IKernel) {
    super(kernel, key);
    this.kernel = kernel;
    this.authProvider = null;
    this.expiresIn = kernel.getConfigStore().get('JWT_EXPIRE') || '1 days';
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

  jwtGenerateAccessToken(data: JwtTokenData): string {
    return jwt.sign(data, this.AesKey, { expiresIn: this.expiresIn });
  }

  async apiTokenValidation(
    username: string,
    token: string,
    requestType: string
  ): Promise<{ valid: boolean; userId: string | null }> {
    if (this.authProvider) {
      return this.authProvider.authorizeToken(username, token, requestType);
    }
    const store = this.kernel.getConfigStore();
    if (!store.has('SERVER_PASSWORD')) {
      return { valid: false, userId: null };
    }
    if (token === store.get('SERVER_PASSWORD') && username === 'admin') {
      return {
        valid: true,
        userId: 'admin',
      };
    }
    return {
      valid: false,
      userId: null,
    };
  }

  async permissionValidation(
    token: JwtToken,
    requestType: string
  ): Promise<boolean> {
    if (this.authProvider) {
      return this.authProvider.validateAccess(token, requestType);
    }
    return false;
  }

  async bearerTokenValidation(req: XRequest): Promise<JwtToken | null> {
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
}
