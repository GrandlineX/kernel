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
import { ExpressServerTiming } from './timing';
import { IExtensionInterface } from './timing/ExpressServerTiming';
import { XNextFc, XRequest, XResponse } from '../lib/express';

export enum ActionMode {
  'DEFAULT',
  'DMZ',
  'DMZ_WITH_USER',
}
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
  mode: ActionMode;

  constructor(chanel: string, module: IBaseKernelModule<K, T, P, C, E>) {
    super(chanel, module);
    this.secureHandler = this.secureHandler.bind(this);
    this.mode = ActionMode.DEFAULT;
  }

  abstract handler(
    req: XRequest,
    res: XResponse,
    next: XNextFc,
    data: JwtToken | null,
    extension: IExtensionInterface
  ): Promise<void>;

  async secureHandler(
    req: XRequest,
    res: XResponse,
    next: () => void
  ): Promise<void> {
    const extension = this.initExtension(res);
    const auth = extension.timing.start('auth');
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

    if (this.mode === ActionMode.DMZ) {
      auth.stop();
      await this.handler(req, res, next, null, extension);
      return;
    }
    const dat = await cc.bearerTokenValidation(req);
    auth.stop();
    if (dat) {
      await this.handler(req, res, next, dat, extension);
    } else if (this.mode === ActionMode.DMZ_WITH_USER) {
      await this.handler(req, res, next, null, extension);
    } else {
      res.status(401).send('no no no ...');
    }
  }

  setMode(mode: ActionMode): void {
    this.mode = mode;
  }
  abstract register(): void;

  private initExtension(res: XResponse): IExtensionInterface {
    const [el, fx] = ExpressServerTiming.init(this, res);
    return {
      done: () => {
        fx();
      },
      timing: el,
    };
  }
}
