import { Request } from 'express';

export interface JwtToken {
  exp: number;
  iat: number;
  username: string;
}

export interface IAuthProvider {
  authorizeToken(
    username: string,
    token: any,
    requestType: string
  ): Promise<boolean>;

  validateAccess(token: JwtToken, requestType: string): Promise<boolean>;

  bearerTokenValidation(req: Request): Promise<JwtToken | null>;
}

export default abstract class BaseAuthProvider implements IAuthProvider {
  abstract authorizeToken(
    username: string,
    token: any,
    requestType: string
  ): Promise<boolean>;

  abstract validateAccess(
    token: JwtToken,
    requestType: string
  ): Promise<boolean>;

  abstract bearerTokenValidation(req: Request): Promise<JwtToken | null>;
}
