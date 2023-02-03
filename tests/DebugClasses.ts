// eslint-disable-next-line max-classes-per-file
import { ICoreAnyModule } from '@grandlinex/core';
import { ActionTypes, AuthResult, BaseApiAction, BaseAuthProvider, ICClient } from '../src';
import { JwtToken } from '../src';
import { XNextFc, XRequest, XResponse } from '../src/lib/express';

export class TestAllAction extends BaseApiAction  {
  constructor(mod: ICoreAnyModule, type: ActionTypes) {
    super(type, '/testpath', mod);
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: XNextFc,
    data: JwtToken | null
  ): Promise<void> {
    if (req.rawBody){
      console.log(req.rawBody)
    }
    res.sendStatus(200);
  }
}

export class TestAuthProvider extends BaseAuthProvider {
  cc: ICClient;

  constructor(cc: ICClient) {
    super();
    this.cc = cc;
  }

  async authorizeToken(
    username: string,
    token: string,
    requestType: string
  ): Promise< AuthResult> {

    const valid=username === 'admin' && token === 'admin' && requestType === 'api';
    return {
      valid,
      userId:"admin"
    };
  }

  async validateAccess(token: JwtToken, requestType: string): Promise<boolean> {
    return token.username === 'admin' && requestType === 'api';
  }

  async bearerTokenValidation(req: XRequest): Promise<JwtToken | number> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      return 401;
    }
    return  await this.cc.jwtVerifyAccessToken(token);
  }
}
