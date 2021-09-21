import { Client, QueryResult } from 'pg';
import { ConfigType, IDataBase, SQLQuery } from '../lib';
import { IBaseKernelModule } from '../../../lib';
import DBConnection from '../classes/DBConnection';

type PGDBType = Client;
export default abstract class PGConnector
  extends DBConnection<QueryResult>
  implements IDataBase<PGDBType>
{
  db: PGDBType | null;

  module: IBaseKernelModule<any, any, any, any>;

  constructor(
    module: IBaseKernelModule<any, any, any, any>,
    dbversion: string
  ) {
    super(dbversion, module.getName(), module);
    this.module = module;
    this.db = null;
  }

  async removeConfig(key: string): Promise<void> {
    try {
      const q = `DELETE
                       FROM ${this.schemaName}.config
                       WHERE c_key = $1;`;
      await this.db?.query(q, [key]);
    } catch (e) {
      this.error(e);
    }
  }

  abstract initNewDB(): Promise<void>;

  async connect(run?: (process: string) => Promise<void>): Promise<boolean> {
    const conf = this.module.getKernel().getGlobalConfig().db?.postgres;
    if (conf === undefined) {
      this.error('NO PG CONFIG FOUND');
      return false;
    }
    let client;
    try {
      client = new Client(conf);
      await client.connect();
      this.db = client;
    } catch (e) {
      this.error(e);
      process.exit(3);

      return false;
    }
    this.log('DB Connected');
    const query = await client.query(
      `SELECT count(schema_name)
             FROM information_schema.schemata
             where schema_name = '${this.schemaName}';`
    );
    if (query.rows.length !== 1) {
      process.exit(3);
    }
    if (query.rows[0].count === '0') {
      this.log('CREATENEW');
      await this.execScripts([
        { exec: `CREATE SCHEMA ${this.schemaName};`, param: [] },
        {
          exec: `CREATE TABLE ${this.schemaName}.config
                           (
                               c_key   TEXT NOT NULL,
                               c_value TEXT,
                               PRIMARY KEY (c_key)
                           );`,
          param: [],
        },
        {
          exec: `INSERT INTO ${this.schemaName}.config (c_key, c_value)
                           VALUES ('dbversion', '${this.dbversion}');`,
          param: [],
        },
      ]);
      await this.initNewDB();
      return true;
    }
    return query.rows[0].count === '1';
  }

  getRawDBObject(): PGDBType | null {
    return this.db;
  }

  async configExist(key: string): Promise<boolean> {
    const query = await this.db?.query(
      `SELECT *
             FROM ${this.schemaName}.config
             WHERE c_key = '${key}'`
    );
    const exist = query?.rowCount;
    return exist === 1;
  }

  async setConfig(key: string, value: string): Promise<boolean> {
    try {
      const q = `INSERT INTO ${this.schemaName}.config (c_key, c_value)
                       VALUES ($1, $2);`;
      await this.db?.query(q, [key, value]);
    } catch (e) {
      this.error(e);
      return false;
    }
    return true;
  }

  async getConfig(key: string): Promise<ConfigType> {
    const query = await this.db?.query(
      `SELECT *
             FROM ${this.schemaName}.config
             WHERE c_key = '${key}'`
    );
    return query?.rows[0];
  }

  async execScripts(list: SQLQuery[]): Promise<QueryResult[]> {
    const output: QueryResult[] = [];
    try {
      for (const el of list) {
        const res = await this.db?.query(el.exec, el.param);
        if (res) {
          output.push(res);
        }
      }
      return output;
    } catch (e) {
      this.error(e);
      return [];
    }
  }

  async disconnect(): Promise<boolean> {
    if (this.db) {
      await this.db?.end();
    }
    return true;
  }
}
