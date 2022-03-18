import { Request } from 'express';

export interface JwtTokenData {
  username: string;
  userid: string;
}
export interface JwtToken extends JwtTokenData {
  exp: number;
  iat: number;
}

export type AuthResult = {
  valid: boolean;
  userId: string | null;
};

export interface IAuthProvider {
  authorizeToken(
    userid: string,
    token: string,
    requestType: string
  ): Promise<AuthResult>;

  validateAccess(token: JwtToken, requestType: string): Promise<boolean>;

  bearerTokenValidation(req: Request): Promise<JwtToken | null>;
}

export default abstract class BaseAuthProvider implements IAuthProvider {
  abstract authorizeToken(
    username: string,
    token: string,
    requestType: string
  ): Promise<AuthResult>;

  abstract validateAccess(
    token: JwtToken,
    requestType: string
  ): Promise<boolean>;

  abstract bearerTokenValidation(req: Request): Promise<JwtToken | null>;
}
