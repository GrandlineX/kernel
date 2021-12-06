import { CoreDBCon, generateSeed } from '@grandlinex/core';
import { randomUUID } from 'crypto';
import GKey from './entity/GKey';

type DBC = CoreDBCon<any, any>;
export async function initNewDB(db: DBC): Promise<void> {
  const seed = generateSeed();
  await db.setConfig('seed', seed);
  await db.setConfig('uid', randomUUID());
}

export async function setKey(
  db: DBC,
  secret: string,
  iv: Buffer,
  auth: Buffer
): Promise<number> {
  const keyStore = db.getEntityWrapper<GKey>('GKey');
  if (keyStore) {
    const res = await keyStore.createObject(
      new GKey({
        secret,
        iv,
        auth,
      })
    );
    return res?.e_id || -1;
  }
  throw new Error('No keystore');
}

export async function getKey(db: DBC, id: number): Promise<GKey | null> {
  const keyStore = db.getEntityWrapper<GKey>('GKey');
  if (keyStore) {
    return keyStore.getObjById(id);
  }
  throw new Error('No keystore');
}

export async function deleteKey(db: DBC, id: number): Promise<void> {
  const keyStore = db.getEntityWrapper<GKey>('GKey');
  if (keyStore) {
    await keyStore.delete(id);
  }
  throw new Error('No keystore');
}
export const KERNEL_DB_VERSION = '1';
