import express from 'express';
import http from 'http';
import { json } from 'body-parser';
import { CorePresenter } from '@grandlinex/core';
import { IBasePresenter, IBaseKernelModule } from '../lib';

export default abstract class BaseEndpoint
  extends CorePresenter<express.Express>
  implements IBasePresenter
{
  private appServer: express.Express;

  private httpServer: http.Server | null;

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
    this.httpServer = null;
  }

  start(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.httpServer = this.appServer
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
}
