import SQLCon from '@grandlinex/bundle-sqlight';
import { IBaseKernelModule, IKernelDb } from '../lib';
import GKey from './entity/GKey';
import * as DBF from './DBFunctions';

export default class KernelDBLight extends SQLCon implements IKernelDb {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super(module, DBF.KERNEL_DB_VERSION);
    this.registerEntity(new GKey());
  }

  deleteKey(id: number): Promise<void> {
    return DBF.deleteKey(this, id);
  }

  getKey(id: number): Promise<GKey | null> {
    return DBF.getKey(this, id);
  }

  initNewDB(): Promise<void> {
    return DBF.initNewDB(this);
  }

  setKey(secret: string, iv: Buffer, auth: Buffer): Promise<number> {
    return DBF.setKey(this, secret, iv, auth);
  }
}
