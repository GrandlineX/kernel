import { JwtPayload } from 'jsonwebtoken';
import { XRequest } from '../lib/express';

export interface JwtToken extends JwtPayload {
  username: string;
  userid: string;
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

  bearerTokenValidation(req: XRequest): Promise<JwtToken | number>;
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

  abstract bearerTokenValidation(req: XRequest): Promise<JwtToken | number>;
}
