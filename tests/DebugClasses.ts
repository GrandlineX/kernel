// eslint-disable-next-line max-classes-per-file
// eslint-disable-next-line max-classes-per-file
import type { ICoreAnyModule } from '@grandlinex/core';
import {
  type ActionTypes,
  BaseApiAction,
  BaseCryptoClient,
  type JwtToken,
  type TokAuthValidationRequest,
  type TokenData,
  type ValidationRequest,
  type XActionEvent,
  type XRequest,
} from '../src';

export class TestAllAction extends BaseApiAction {
  constructor(mod: ICoreAnyModule, type: ActionTypes) {
    super(type, '/testpath', mod);
    this.handler = this.handler.bind(this);
    this.forceDebug = true;
  }

  async handler({ req, res, agent }: XActionEvent): Promise<void> {
    if (req.rawBody) {
      console.log(req.rawBody, [
        agent.getBrowser(),
        agent.getRaw(),
        agent.getChromeVersion(),
        agent.getEdgeVersion(),
        agent.getFirefoxVersion(),
        agent.getOperaVersion(),
        agent.getGeckoVersion(),
        agent.getOculusVersion(),
        agent.getSafariVersion(),
        agent.getMozillaVersion(),
        agent.getXVersion('WrongParam'),
      ]);
    }
    res.sendStatus(200);
  }
}

export class TestCryptoClient extends BaseCryptoClient {
  async apiTokenValidation(
    request: TokAuthValidationRequest,
  ): Promise<{ valid: boolean; userId: string | null }> {
    if (request.requestType === 'refresh') {
      return { valid: true, userId: request.refresh.sub! };
    }
    const { username, password } = request;
    const valid = username === 'admin' && password === 'admin';
    return {
      valid,
      userId: 'admin',
    };
  }

  async permissionValidation(request: ValidationRequest): Promise<boolean> {
    const { token, requestType } = request;
    return token.username === 'admin' && requestType.includes('api');
  }

  async generateToken(
    userID: string,
    userName: string,
    refresh: boolean,
    jti?: string,
  ): Promise<TokenData> {
    const nJTI = jti ?? this.getUUID();
    const token = await this.jwtGenerateAccessToken(
      {
        sub: userID,
        username: userName,
        jti: nJTI,
        type: 'token',
      },
      'default',
    );
    const refreshToken = refresh
      ? await this.jwtGenerateAccessToken(
          {
            sub: userID,
            username: userName,
            jti: nJTI,
            type: 'refresh',
          },
          'refresh',
        )
      : undefined;
    return { token, refresh: refreshToken };
  }

  async generateRefreshToken(token: JwtToken): Promise<TokenData | null> {
    if (token.type === 'refresh') {
      return this.generateToken(token.username, token.sub!, true, token.jti);
    }
    return null;
  }

  async bearerTokenValidation(req: XRequest): Promise<JwtToken | number> {
    const token = this.tokenExtractor(req);
    if (!token) {
      return 401;
    }
    return this.jwtVerifyAccessToken(token);
  }

  tokenExtractor(req: XRequest): string | undefined {
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

  setCookie(): Promise<void> {
    return Promise.resolve();
  }
}
