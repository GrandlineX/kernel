import { CoreAction, IDataBase } from '@grandlinex/core';
import {
  IBaseAction,
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib/index.js';
import { ExpressServerTiming, IExtensionInterface } from './timing/index.js';

import { XActionEvent, XRequest, XResponse } from '../lib/express.js';

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
    E extends IBasePresenter | null = any,
  >
  extends CoreAction<K, T, P, C, E>
  implements IBaseAction<K, T, P, C, E>
{
  mode: ActionMode;

  forceDebug: boolean;

  constructor(chanel: string, module: IBaseKernelModule<K, T, P, C, E>) {
    super(chanel, module);
    this.secureHandler = this.secureHandler.bind(this);
    this.mode = ActionMode.DEFAULT;
    this.forceDebug = false;
  }

  abstract handler(event: XActionEvent): Promise<void>;

  async secureHandler(
    req: XRequest,
    res: XResponse,
    next: () => void,
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
      try {
        await this.handler({
          res,
          req,
          next,
          data: null,
          extension,
        });
      } catch (e: any) {
        this.error(e);
        this.error(e?.message);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
      return;
    }
    const dat = await cc.bearerTokenValidation(req);
    auth.stop();
    if (dat && typeof dat !== 'number') {
      try {
        await this.handler({
          res,
          req,
          next,
          data: dat,
          extension,
        });
      } catch (e: any) {
        this.error(e);
        this.error(e?.message);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
    } else if (this.mode === ActionMode.DMZ_WITH_USER) {
      try {
        await this.handler({
          res,
          req,
          next,
          data: null,
          extension,
        });
      } catch (e: any) {
        this.error(e);
        this.error(e?.message);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
    } else if (dat) {
      res.sendStatus(dat);
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
