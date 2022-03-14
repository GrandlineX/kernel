import {
  ActionTypes,
  IBaseAction,
  IBaseKernelModule,
  IBasePresenter,
} from '../lib';
import BaseAction from './BaseAction';

export default abstract class BaseApiAction
  extends BaseAction
  implements IBaseAction
{
  exmod: undefined | IBaseKernelModule<any, any, any, any>;

  type: ActionTypes;

  constructor(
    type: ActionTypes,
    chanel: string,
    module: IBaseKernelModule<any, any, any, any>,
    extMod?: IBaseKernelModule<any, any, any, any>
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
