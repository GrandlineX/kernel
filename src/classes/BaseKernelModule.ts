import { CoreKernelModule, IDataBase } from '@grandlinex/core';
import {
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib';

export default abstract class BaseKernelModule<
    K extends IKernel = IKernel,
    T extends IDataBase<any, any> | null = any,
    P extends IBaseClient | null = any,
    C extends IBaseCache | null = any,
    E extends IBasePresenter | null = any
  >
  extends CoreKernelModule<K, T, P, C, E>
  implements IBaseKernelModule<K, T, P, C, E> {}
