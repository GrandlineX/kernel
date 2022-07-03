import { Request, Response } from 'express';
import { CoreAction, IDataBase } from '@grandlinex/core';
import {
  IBaseAction,
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib';
import { JwtToken } from './BaseAuthProvider';

export default abstract class BaseAction<
    K extends IKernel = IKernel,
    T extends IDataBase<any, any> | null = any,
    P extends IBaseClient | null = any,
    C extends IBaseCache | null = any,
    E extends IBasePresenter | null = any
  >
  extends CoreAction<K, T, P, C, E>
  implements IBaseAction<K, T, P, C, E>
{
  dmz = false;

  constructor(chanel: string, module: IBaseKernelModule<K, T, P, C, E>) {
    super(chanel, module);
    this.secureHandler = this.secureHandler.bind(this);
  }

  abstract handler(
    req: Request,
    res: Response,
    next: () => void,
    data: JwtToken | null
  ): Promise<void>;

  async secureHandler(
    req: Request,
    res: Response,
    next: () => void
  ): Promise<void> {
    res.on('finish', () => {
      (this.getKernel() as IKernel).responseCodeFunction({
        code: res.statusCode,
        req,
      });
    });
    const cc = this.getKernel().getCryptoClient();
    if (!cc) {
      res.status(504).send('internal server error');
      return;
    }
    if (this.dmz) {
      await this.handler(req, res, next, null);
      return;
    }
    const dat = await cc.bearerTokenValidation(req);

    if (dat) {
      await this.handler(req, res, next, dat);
    } else {
      res.status(401).send('no no no ...');
    }
  }

  abstract register(): void;

  setDmz(val: boolean) {
    this.dmz = val;
  }

  getDmz() {
    return this.dmz;
  }
}
