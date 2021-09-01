import BaseElement from './BaseElement';
import { IBaseService, ServiceStates } from '../lib';

export default abstract class BaseService
  extends BaseElement
  implements IBaseService
{
  public forceStop = false;

  public state: ServiceStates = 'INIT';

  getName() {
    return this.chanel;
  }

  abstract start(): Promise<any>;

  abstract stop(): Promise<any>;
}
