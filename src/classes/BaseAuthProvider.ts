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

  validateAcces(token: JwtToken, requestType: string): Promise<boolean>;
}

export default abstract class BaseAuthProvider implements IAuthProvider {
  abstract authorizeToken(
    username: string,
    token: any,
    requestType: string
  ): Promise<boolean>;

  abstract validateAcces(
    token: JwtToken,
    requestType: string
  ): Promise<boolean>;
}
