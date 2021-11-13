import Kernel, { BaseAuthProvider, ICClient } from '../src';
import { JwtToken } from '../src/classes/BaseAuthProvider';
import { Request } from 'express';
import * as  Path from 'path';

const pathOverride = Path.join(__dirname, '..', 'data', 'config');
const root = Path.join(__dirname, '..');


export function testKernelUtil(appName:string,portOverride?: number) {
  return  new Kernel( { appName:appName.toUpperCase(), appCode:appName.toLowerCase(), pathOverride, portOverride ,envFilePath:root});
}


export class TestAuthProvider extends  BaseAuthProvider{

  cc:ICClient
  constructor(cc:ICClient) {
    super();
    this.cc=cc;
  }
  async authorizeToken(username: string, token: any, requestType: string): Promise<boolean> {
    return username ==='admin' && token ==='admin' && requestType ==='api';
  }

  async validateAcces(token: JwtToken, requestType: string): Promise<boolean> {
    return token.username==="admin" && requestType === "api";
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
