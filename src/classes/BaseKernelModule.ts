import { CoreKernelModule, IDataBase } from '@grandlinex/core';
import { BaseClient } from 'classes';
import { IBaseCache, IBaseEndpoint, IBaseKernelModule, IKernel } from '../lib';

export default abstract class BaseKernelModule<
    T extends IDataBase<any> | null,
    P extends BaseClient | null,
    C extends IBaseCache | null,
    E extends IBaseEndpoint | null
  >
  extends CoreKernelModule<IKernel, T, P, C, E>
  implements IBaseKernelModule<T | null, P | null, C | null, E | null> {}
