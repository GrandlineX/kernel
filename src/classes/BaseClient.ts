import { IBaseElement, IBaseKernelModule } from '../lib';
import BaseElement from './BaseElement';

export default abstract class BaseClient
  extends BaseElement
  implements IBaseElement
{
  constructor(chanel: string, module: IBaseKernelModule<any, any, any, any>) {
    super(`client-${chanel}`, module);
  }
}
