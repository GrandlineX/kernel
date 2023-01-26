import express from 'express';
import http from 'http';
import { json } from 'body-parser';
import { CorePresenter, IDataBase } from '@grandlinex/core';
import {
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib';
import { XRequest, XResponse } from '../lib/express';

export function keepRawBody(
  req: XRequest,
  res: XResponse,
  buf: Buffer,
  encoding: string
) {
  if (buf && buf.length) {
    try {
      req.rawBody = buf.toString((encoding as BufferEncoding) || 'utf8');
    } catch (e) {
      req.rawBody = null;
    }
  }
}

export default abstract class BaseEndpoint<
    K extends IKernel = IKernel,
    T extends IDataBase<any, any> | null = any,
    P extends IBaseClient | null = any,
    C extends IBaseCache | null = any,
    E extends IBasePresenter | null = any
  >
  extends CorePresenter<express.Express, K, T, P, C, E>
  implements IBasePresenter
{
  protected appServer: express.Express;

  protected httpServer: http.Server;

  protected port: number;

  constructor(
    chanel: string,
    module: IBaseKernelModule<any, any, any, any>,
    port: number
  ) {
    super(`endpoint-${chanel}`, module);
    this.port = port;
    this.appServer = express();
    this.appServer.use(json({ verify: keepRawBody }));
    this.httpServer = http.createServer(this.appServer);
  }

  start(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.httpServer
        .listen(this.port, () => {
          this.info(`Endpoint listen on ${this.port}`);
          resolve(true);
        })
        .on('error', (err) => {
          this.error(err);
          resolve(false);
        });
    });
  }

  stop(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.httpServer) {
        this.httpServer.close((err) => (err ? resolve(false) : resolve(true)));
      }
    });
  }

  getApp(): express.Express {
    return this.appServer;
  }

  getServer(): http.Server {
    return this.httpServer;
  }
}
