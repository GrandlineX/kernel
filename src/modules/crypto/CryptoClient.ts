import { CoreCryptoClient } from '@grandlinex/core';
import * as jwt from 'jsonwebtoken';
import { ICClient, IKernel } from '../../lib/index.js';
import { IAuthProvider, JwtToken } from '../../classes/index.js';
import { XRequest } from '../../lib/express.js';

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

  jwtVerifyAccessToken(token: string): Promise<JwtToken | number> {
    return new Promise((resolve) => {
      jwt.verify(token, this.AesKey, (err, user: any) => {
        if (err instanceof jwt.TokenExpiredError) {
          resolve(498);
        } else if (err || user === null) {
          resolve(403);
        } else {
          resolve(user);
        }
      });
    });
  }

  jwtDecodeAccessToken(token: string): jwt.JwtPayload | null {
    return jwt.decode(token, { json: true });
  }

  jwtGenerateAccessToken(data: JwtToken, expire?: string | number): string {
    return jwt.sign(data, this.AesKey, { expiresIn: expire ?? this.expiresIn });
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
    const cc = this.kernel.getCryptoClient();
    if (!store.has('SERVER_PASSWORD')) {
      return { valid: false, userId: null };
    }
    if (
      cc?.timeSavePWValidation(token, store.get('SERVER_PASSWORD') || '') ||
      (token === store.get('SERVER_PASSWORD') && username === 'admin')
    ) {
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

  async bearerTokenValidation(req: XRequest): Promise<JwtToken | number> {
    if (this.authProvider) {
      return this.authProvider.bearerTokenValidation(req);
    }
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return 401;
    }
    const tokenData = await this.jwtVerifyAccessToken(token);
    if (tokenData) {
      return tokenData;
    }
    return 403;
  }
}
