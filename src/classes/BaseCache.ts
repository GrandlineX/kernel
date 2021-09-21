import { IBaseCache, IBaseKernelModule } from '../lib';
import BaseElement from './BaseElement';

export default abstract class BaseCache
  extends BaseElement
  implements IBaseCache
{
  constructor(chanel: string, module: IBaseKernelModule<any, any, any, any>) {
    super(`client-${chanel}`, module);
  }

  abstract start(): Promise<void>;

  abstract stop(): Promise<void>;

  abstract set(key: string, val: string): Promise<void>;

  abstract get(key: string): Promise<string | undefined>;

  abstract delete(key: string): Promise<void>;

  abstract clearAll(key: string): Promise<void>;

  abstract exist(key: string): Promise<boolean>;
}
