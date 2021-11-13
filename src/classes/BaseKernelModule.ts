import { CoreKernelModule, IDataBase } from '@grandlinex/core';
import { BaseClient } from 'classes';
import { IBaseCache, IBaseKernelModule, IBasePresenter, IKernel } from '../lib';

export default abstract class BaseKernelModule<
    T extends IDataBase<any, any> | null,
    P extends BaseClient | null,
    C extends IBaseCache | null,
    E extends IBasePresenter | null
  >
  extends CoreKernelModule<IKernel, T, P, C, E>
  implements IBaseKernelModule<T | null, P | null, C | null, E | null> {}
