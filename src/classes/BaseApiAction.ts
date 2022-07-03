import { IDataBase } from '@grandlinex/core';
import {
  ActionTypes,
  IBaseAction,
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib';
import BaseAction from './BaseAction';

export default abstract class BaseApiAction<
    K extends IKernel = IKernel,
    T extends IDataBase<any, any> | null = any,
    P extends IBaseClient | null = any,
    C extends IBaseCache | null = any,
    E extends IBasePresenter | null = any
  >
  extends BaseAction<K, T, P, C, E>
  implements IBaseAction<K, T, P, C, E>
{
  exmod: undefined | IBaseKernelModule<K>;

  type: ActionTypes;

  constructor(
    type: ActionTypes,
    chanel: string,
    module: IBaseKernelModule<K, T, P, C, E>,
    extMod?: IBaseKernelModule<K>
  ) {
    super(chanel, module);
    this.exmod = extMod;
    this.type = type;
  }

  register(): void {
    let endpoint: IBasePresenter | null;
    if (this.exmod) {
      endpoint = this.exmod.getPresenter();
    } else {
      endpoint = this.getModule().getPresenter();
    }
    if (endpoint) {
      this.log(`register ${this.type} ${this.getName()}`);
      const app = endpoint.getApp();
      switch (this.type) {
        case 'POST':
          app.post(this.getName(), this.secureHandler);
          break;
        case 'USE':
          app.use(this.getName(), this.secureHandler);
          break;
        case 'PATCH':
          app.patch(this.getName(), this.secureHandler);
          break;
        case 'DELETE':
          app.delete(this.getName(), this.secureHandler);
          break;
        case 'GET':
        default:
          app.get(this.getName(), this.secureHandler);
          break;
      }
    } else {
      this.error(`on register -> ${this.getName()}`);
      this.error(`No Endpoint found`);
    }
  }
}
