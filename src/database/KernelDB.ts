import { randomUUID } from 'crypto';
import newInit from './newInit';
import { KeyType } from '../lib';
import PGConnector from '../modules/DBConnector/connectors/PGConnector';
import { generateSeed } from '../modules/crypto/utils';

export default class KernelDB extends PGConnector {
  async initNewDB(): Promise<void> {
    await this.execScripts(newInit(this.schemaName));
    const seed = generateSeed();
    await this.setConfig('seed', seed);
    await this.setConfig('uid', randomUUID());
  }

  async setKey(secret: string, iv: Buffer, auth: Buffer): Promise<number> {
    try {
      const query = await this.db?.query(
        `INSERT INTO ${this.schemaName}.keys (secret, iv, auth) VALUES ($1,$2,$3) RETURNING id;`,
        [secret, iv, auth]
      );
      if (!query) {
        return -1;
      }
      const row = query.rows[0];
      return row.id;
    } catch (e) {
      this.error(e);
      throw e;
    }
  }

  async getKey(id: number): Promise<KeyType> {
    const query = await this.db?.query(
      `SELECT *
             FROM ${this.schemaName}.keys
             WHERE id = ${id}`
    );
    const res = query?.rows[0];
    const auth = res.auth as string;

    const buffer = Buffer.from(auth);
    return {
      id: res.id,
      secret: res.secret,
      iv: res.iv,
      auth: buffer,
    };
  }

  async deleteKey(id: number): Promise<void> {
    await this.db?.query(
      `DELETE
             FROM ${this.schemaName}.keys
             WHERE id = ${id}`
    );
  }
}
