import { SQLightConnector } from '@grandlinex/core';
import { IBaseKernelModule, IKernelDb, KeyType } from '../lib';

export default class KernelDBLight
  extends SQLightConnector
  implements IKernelDb
{
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super(module, '1');
  }

  async initNewDB(): Promise<any> {
    await this.execScripts([
      {
        exec: 'CREATE TABLE main.keys(id INTEGER PRIMARY KEY ,secret TEXT, iv BLOB, auth BLOB);',
        param: [],
      },
    ]);
  }

  async setKey(secret: string, iv: Buffer, auth: Buffer): Promise<number> {
    const query = this.db?.prepare(
      `REPLACE INTO main.keys (secret,iv ,auth) VALUES (?,?,?);`
    );
    if (query === undefined) {
      return -1;
    }
    const row = `${query.run([secret, iv, auth]).lastInsertRowid}`;
    return Number.parseInt(row, 10);
  }

  async getKey(id: number): Promise<KeyType> {
    const query = this.db?.prepare(`SELECT * FROM main.keys WHERE id=${id}`);
    return query?.get();
  }

  async deleteKey(id: number): Promise<void> {
    const query = this.db?.prepare(`DELETE FROM main.keys WHERE id=${id}`);
    query?.run();
  }
}
