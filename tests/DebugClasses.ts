// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express';
import { ICoreAnyModule } from '@grandlinex/core';
import Kernel, { ActionTypes, AuthResult, BaseApiAction, BaseAuthProvider, ICClient } from '../src';
import { JwtToken } from '../src';

export class TestAllAction extends BaseApiAction  {
  constructor(mod: ICoreAnyModule, type: ActionTypes) {
    super(type, '/testpath', mod);
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: Request,
    res: Response,
    next: () => void,
    data: JwtToken | null
  ): Promise<void> {
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

  async bearerTokenValidation(req: Request): Promise<JwtToken | null> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      return null;
    }
    const tokenData = await this.cc.jwtVerifyAccessToken(token);
    if (tokenData) {
      return tokenData;
    }
    return null;
  }
}
