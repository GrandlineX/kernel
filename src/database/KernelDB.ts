import { CoreDBCon, CoreEntityWrapper, generateSeed } from '@grandlinex/core';
import CoreDBPrefab from '@grandlinex/core/dist/classes/CoreDBPrefab';
import { randomUUID } from 'crypto';
import { IKernelDb } from '../lib';
import GKey from './entity/GKey';

export const KERNEL_DB_VERSION = '1';

export default class KernelDB extends CoreDBPrefab<any> implements IKernelDb {
  private gKey: CoreEntityWrapper<GKey>;

  constructor(db: CoreDBCon<any, any>) {
    super(db);
    this.gKey = this.registerEntity<GKey>(new GKey());
  }

  async initPrefabDB(): Promise<void> {
    const seed = generateSeed();
    await this.setConfig('seed', seed);
    await this.setConfig('uid', randomUUID());
  }

  async deleteKey(id: number): Promise<void> {
    await this.gKey.delete(id);
  }

  getKey(id: number): Promise<GKey | null> {
    return this.gKey.getObjById(id);
  }

  async setKey(secret: string, iv: Buffer, auth: Buffer): Promise<number> {
    return (await this.gKey.createObject({ secret, iv, auth })).e_id;
  }
}
