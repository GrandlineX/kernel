import { randomUUID } from 'crypto';

import { generateSeed } from '@grandlinex/core';
import { PGCon } from '@grandlinex/bundle-postgresql';
import { IBaseKernelModule, IKernelDb } from '../lib';
import GKey from './entity/GKey';

export const KERNEL_DB_VERSION = '1';
export default class KernelDB extends PGCon implements IKernelDb {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super(module, KERNEL_DB_VERSION);
    this.registerEntity(new GKey());
  }

  async initNewDB(): Promise<void> {
    const seed = generateSeed();
    await this.setConfig('seed', seed);
    await this.setConfig('uid', randomUUID());
  }

  async setKey(secret: string, iv: Buffer, auth: Buffer): Promise<number> {
    const keyStore = this.getEntityWrapper<GKey>('GKey');
    if (keyStore) {
      const res = await keyStore.createObject(
        new GKey({
          e_id: null,
          secret,
          iv,
          auth,
        })
      );
      return res?.e_id || -1;
    }
    throw new Error('No keystore');
  }

  async getKey(id: number): Promise<GKey | null> {
    const keyStore = this.getEntityWrapper<GKey>('GKey');
    if (keyStore) {
      return keyStore.getObjById(id);
    }
    throw new Error('No keystore');
  }

  async deleteKey(id: number): Promise<void> {
    const keyStore = this.getEntityWrapper<GKey>('GKey');
    if (keyStore) {
      await keyStore.delete(id);
    }
    throw new Error('No keystore');
  }
}
