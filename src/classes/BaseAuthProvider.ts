import * as jwt from 'jsonwebtoken';
import { XRequest } from '../lib/express.js';

export type JwtExtend = {
  username: string;
  userid: string;
} & Partial<Record<string, string | number | number[] | string[]>>;

export type JwtToken<T extends JwtExtend = JwtExtend> = T & jwt.JwtPayload;

export type AuthResult = {
  valid: boolean;
  userId: string | null;
};

export interface IAuthProvider<T extends JwtExtend> {
  authorizeToken(
    userid: string,
    token: string,
    requestType: string,
  ): Promise<AuthResult>;

  validateAccess(token: JwtToken<T>, requestType: string): Promise<boolean>;

  bearerTokenValidation(req: XRequest): Promise<JwtToken<T> | number>;

  jwtAddData(
    token: JwtToken<T>,
    extend?: Record<string, any>,
  ): Promise<JwtToken<T>>;
}

export default abstract class BaseAuthProvider<T extends JwtExtend = JwtExtend>
  implements IAuthProvider<T>
{
  abstract authorizeToken(
    username: string,
    token: string,
    requestType: string,
  ): Promise<AuthResult>;

  abstract validateAccess(
    token: JwtToken<T>,
    requestType: string,
  ): Promise<boolean>;

  abstract bearerTokenValidation(req: XRequest): Promise<JwtToken<T> | number>;

  async jwtAddData(
    token: JwtToken<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extend?: Record<string, any>,
  ): Promise<JwtToken<T>> {
    return token;
  }
}
