import { IBaseElement, IBaseKernelModule, IKernel } from '../lib';
import Logger from '../modules/logger/Logger';

export default abstract class BaseElement
  extends Logger
  implements IBaseElement
{
  chanel: string;

  private module: IBaseKernelModule<any, any, any, any>;

  constructor(chanel: string, module: IBaseKernelModule<any, any, any, any>) {
    super(`element-${chanel}`, module.getKernel().getGlobalConfig().dir.temp);
    this.chanel = chanel;
    this.module = module;
  }

  getKernel(): IKernel {
    return this.module.getKernel();
  }

  getModule() {
    return this.module;
  }
}
