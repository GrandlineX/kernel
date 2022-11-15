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
  private appServer: express.Express;

  private httpServer: http.Server;

  private port: number;

  constructor(
    chanel: string,
    module: IBaseKernelModule<any, any, any, any>,
    port: number
  ) {
    super(`endpoint-${chanel}`, module);
    this.port = port;
    this.appServer = express();
    this.appServer.use(json());
    this.httpServer = http.createServer(this.appServer);
  }

  start(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.httpServer
        .listen(this.port, () => {
          this.debug(`Endpoint listen on ${this.port}`);
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
