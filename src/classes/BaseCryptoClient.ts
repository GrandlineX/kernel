import { CoreCryptoClient } from '@grandlinex/core';
import jwt from 'jsonwebtoken';
import { type StringValue } from 'ms';
import type {
  ICClient,
  IKernel,
  JwtToken,
  TokAuthValidationRequest,
  TokenData,
  ValidationRequest,
} from '../lib';
import type { XRequest, XResponse } from '../lib/express';

export default abstract class BaseCryptoClient
  extends CoreCryptoClient
  implements ICClient
{
  protected kernel: IKernel;

  readonly expiresIn: StringValue | number;

  readonly expiresInRefresh: StringValue | number;

  constructor(key: string, kernel: IKernel) {
    super(kernel, key);
    this.kernel = kernel;
    this.expiresIn = (kernel.getConfigStore().get('JWT_EXPIRE') ||
      '1 days') as StringValue;
    this.expiresInRefresh = (kernel
      .getConfigStore()
      .get('JWT_REFRESH_EXPIRE') || '7 days') as StringValue;
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

  jwtDecodeAccessToken(token: string): JwtToken | null {
    // MSJ-CJS SWITCH
    const mod = (jwt as any).default || jwt;
    return mod.decode(token, { json: true });
  }

  async jwtGenerateAccessToken(
    data: JwtToken,
    expire: 'default' | 'refresh' | StringValue | number = 'default',
  ): Promise<string> {
    let exp;
    if (expire === 'default') {
      exp = this.expiresIn;
    } else if (expire === 'refresh') {
      exp = this.expiresInRefresh;
    } else if (expire !== undefined) {
      exp = expire;
    } else {
      exp = this.expiresIn;
    }
    return jwt.sign(data, this.AesKey, {
      expiresIn: exp,
    });
  }

  abstract apiTokenValidation(request: TokAuthValidationRequest): Promise<{
    valid: boolean;
    userId: string | null;
  }>;

  abstract permissionValidation(request: ValidationRequest): Promise<boolean>;

  abstract generateToken(
    userID: string,
    userName: string,
    refresh: boolean,
    jti?: string,
  ): Promise<TokenData>;

  abstract generateRefreshToken(token: JwtToken): Promise<TokenData | null>;

  abstract bearerTokenValidation(req: XRequest): Promise<JwtToken | number>;

  abstract tokenExtractor(req: XRequest): string | undefined;

  abstract setCookie(req: XResponse, data: TokenData): Promise<void>;
}
