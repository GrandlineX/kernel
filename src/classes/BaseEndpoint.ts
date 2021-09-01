import express from 'express';
import http from 'http';
import { json } from 'body-parser';
import { IBaseEndpoint, IBaseKernelModule, IKernel } from '../lib';
import Logger from '../modules/logger/Logger';

export default abstract class BaseEndpoint
  extends Logger
  implements IBaseEndpoint
{
  private module: IBaseKernelModule<any, any, any, any>;

  private appServer: express.Express;

  private httpServer: http.Server | null;

  private port: number;

  constructor(
    chanel: string,
    module: IBaseKernelModule<any, any, any, any>,
    port: number
  ) {
    super(`endpoint-${chanel}`, module.getKernel().getGlobalConfig().dir.temp);
    this.module = module;
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
      this.httpServer?.close((err) => (err ? resolve(false) : resolve(true)));
    });
  }

  getKernel(): IKernel {
    return this.module.getKernel();
  }

  getModule(): IBaseKernelModule<any, any, any, any> {
    return this.module;
  }

  getApp(): express.Express {
    return this.appServer;
  }
}
