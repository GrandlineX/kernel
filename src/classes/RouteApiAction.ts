import { IDataBase } from '@grandlinex/core';
import {
  IBaseAction,
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib/index.js';
import { getRouteMeta } from '../annotation/index.js';
import BaseApiAction from './BaseApiAction.js';

export default abstract class RouteApiAction<
    K extends IKernel = IKernel,
    T extends IDataBase<any, any> | null = any,
    P extends IBaseClient | null = any,
    C extends IBaseCache | null = any,
    E extends IBasePresenter | null = any,
  >
  extends BaseApiAction<K, T, P, C, E>
  implements IBaseAction<K, T, P, C, E>
{
  constructor(
    module: IBaseKernelModule<K, T, P, C, E>,
    extMod?: IBaseKernelModule<K>,
  ) {
    super('GET', 'action', module, extMod);
    this.exmod = extMod;
    const meta = getRouteMeta(this);
    if (!meta) {
      throw this.lError('No route meta found for action');
    }
    const { type, path, mode, schema } = meta;
    this.type = type;
    this.channel = path;
    if (mode) {
      this.setMode(mode);
    }
    this.schema = schema ?? null;
  }
}
