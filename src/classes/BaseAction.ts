import { Request, Response } from 'express';
import { CoreAction } from '@grandlinex/core';
import { IBaseAction, IBaseKernelModule } from '../lib';
import { JwtToken } from './BaseAuthProvider';

export default abstract class BaseAction
  extends CoreAction
  implements IBaseAction
{
  dmz = false;

  constructor(chanel: string, module: IBaseKernelModule<any, any, any, any>) {
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
