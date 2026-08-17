import type {
  ICClient,
  JwtToken,
  TokAuthValidationRequest,
  TokenData,
} from '../../lib';
import { BaseCryptoClient } from '../../classes';
import type { XRequest } from '../../lib/express';

export default class CryptoClient extends BaseCryptoClient implements ICClient {
  async apiTokenValidation(request: TokAuthValidationRequest): Promise<{
    valid: boolean;
    userId: string | null;
  }> {
    if ('refresh' in request) {
      return { valid: false, userId: null };
    }
    const { password, username } = request;
    const store = this.kernel.getConfigStore();
    const cc = this.kernel.getCryptoClient();
    if (!password || !store.has('SERVER_PASSWORD')) {
      return { valid: false, userId: null };
    }
    if (
      (cc?.timeSavePWValidation(password, store.get('SERVER_PASSWORD') || '') ||
        password === store.get('SERVER_PASSWORD')) &&
      username === 'admin'
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

  async permissionValidation(): Promise<boolean> {
    return false;
  }

  async generateToken(userID: string, userName: string): Promise<TokenData> {
    const jti = this.getUUID();
    const token = await this.jwtGenerateAccessToken({
      sub: userID,
      username: userName,
      jti,
      type: 'token',
    });
    return { token };
  }

  async generateRefreshToken(token: JwtToken): Promise<TokenData | null> {
    const newToken = await this.jwtGenerateAccessToken({
      sub: token.sub!,
      username: token.username,
      jti: token.jti,
      type: 'token',
    });
    return { token: newToken };
  }

  async bearerTokenValidation(req: XRequest): Promise<JwtToken | number> {
    const token = this.tokenExtractor(req);
    if (!token) {
      return 401;
    }
    const tokenData = await this.jwtVerifyAccessToken(token);
    if (tokenData) {
      return tokenData;
    }
    return 403;
  }

  tokenExtractor(req: XRequest) {
    let token: string | undefined;
    if (req.headers.authorization !== undefined) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(' ')[1];
    } else if (req.query.glxauth !== undefined) {
      token = req.query.glxauth as string;
    } else if (req.headers.cookie !== undefined) {
      const crumbs = req.headers.cookie.trim();
      const coList = crumbs.split(';');
      const oel = coList.find((el) => el.startsWith(`glxauth=`));
      token = oel?.split('=')[1];
    }
    return token;
  }

  async setCookie(): Promise<void> {
    return Promise.resolve();
  }
}
