import { IBaseElement, IBaseKernelModule, IKernel } from '../lib';
import Logger from '../modules/logger/Logger';

export default abstract class BaseClient
  extends Logger
  implements IBaseElement
{
  module: IBaseKernelModule<any, any, any, any>;

  constructor(chanel: string, module: IBaseKernelModule<any, any, any, any>) {
    super(`client-${chanel}`, module.getKernel().getGlobalConfig().dir.temp);
    this.module = module;
  }

  getKernel(): IKernel {
    return this.module.getKernel();
  }

  getModule(): IBaseKernelModule<any, any, any, any> {
    return this.module;
  }
}
