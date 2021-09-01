import {
  ActionTypes,
  IBaseAction,
  IBaseEndpoint,
  IBaseKernelModule,
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
    let endpoint: IBaseEndpoint | null;
    if (this.exmod) {
      endpoint = this.exmod.getEndpoint();
    } else {
      endpoint = this.getModule().getEndpoint();
    }
    if (endpoint) {
      this.log(`register ${this.chanel}`);
      const app = endpoint.getApp();
      switch (this.type) {
        case 'POST':
          app.post(this.chanel, this.secureHandler);
          break;
        case 'USE':
          app.use(this.chanel, this.secureHandler);
          break;
        case 'GET':
        default:
          app.get(this.chanel, this.secureHandler);
          break;
      }
    } else {
      this.error(`on register -> ${this.chanel}`);
      this.error(`No Endpoint found`);
    }
  }
}
