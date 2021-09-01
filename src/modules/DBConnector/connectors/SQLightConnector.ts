import * as Path from 'path';
import { RunResult } from 'better-sqlite3';
import Database = require('better-sqlite3');
import { ConfigType, IDataBase, SQLQuery } from '../lib';
import { IBaseKernelModule } from '../../../lib';
import DBConnection from '../classes/DBConnection';

type DbType = Database.Database;

export default abstract class SQLightConnector
  extends DBConnection
  implements IDataBase<DbType>
{
  db: DbType | null;

  private path: string;

  constructor(
    module: IBaseKernelModule<any, any, any, any>,
    dbversion: string
  ) {
    super(dbversion, module);
    this.path = Path.join(
      module.getKernel().getGlobalConfig().dir.db,
      `${module.getName()}.db`
    );
    this.db = null;
  }

  async removeConfig(key: string): Promise<void> {
    try {
      const q = `DELETE
                       FROM main.config
                       WHERE c_key = $1;`;
      const query = await this.db?.prepare(q);
      query?.run([key]);
    } catch (e) {
      this.error(e);
    }
  }

  abstract initNewDB(): Promise<void>;

  async connect(run?: (process: string) => Promise<void>): Promise<boolean> {
    try {
      this.db = new Database(this.path, {
        verbose: this.debug,
      });
    } catch (e) {
      this.error(e);
      return false;
    }
    try {
      const query = this.db.prepare('SELECT * FROM  main.config;');
      const result = query.all();
      const version = result.find((el) => {
        return el.c_key === 'dbversion';
      });
      let v;
      if (version === undefined) {
        v = '0';
      } else {
        v = version.c_value;
      }
      if (v !== this.dbversion && this.updater !== null) {
        if (run) {
          await run('Datenbank Update');
        }
        this.log(`DB UPDATE INFO from ${v}  to ${this.dbversion}`);

        const newUpdate = this.updater.find(v);
        if (newUpdate !== null) {
          const res = await newUpdate.update();
          if (!res) {
            this.error('Error While DB UPDATE');
          }
          return res;
        }

        this.error('Cant Found UPDATE ');
        return false;
      }
      return true;
    } catch (e) {
      this.warn(e);
      this.log('Create new Database');
      if (run) {
        await run('Erstelle neue Datenbank');
      }

      await this.execScripts([
        {
          exec: 'CREATE TABLE  main.config(c_key text not null ,c_value text , PRIMARY KEY (c_key));',
          param: [],
        },
        {
          exec: `INSERT INTO main.config (c_key, c_value)
                           VALUES ('dbversion', '${this.dbversion}');`,
          param: [],
        },
      ]);
      await this.initNewDB();
      return true;
    }
  }

  getRawDBObject(): DbType | null {
    return this.db;
  }

  async configExist(key: string): Promise<boolean> {
    const query = this.db?.prepare(
      `SELECT *
             FROM main.config
             WHERE c_key = '${key}'`
    );
    const exist = query?.get();
    return !!exist && exist.c_key !== undefined && exist.c_value !== undefined;
  }

  async setConfig(key: string, value: string): Promise<boolean> {
    const query = this.db?.prepare(
      `REPLACE INTO main.config (c_key, c_value)
             VALUES ('${key}', '${value}');`
    );
    if (query === undefined) {
      return false;
    }
    query.run();
    return true;
  }

  async getConfig(key: string): Promise<ConfigType> {
    const query = this.db?.prepare(
      `SELECT *
             FROM main.config
             WHERE c_key = '${key}'`
    );
    return query?.get();
  }

  async execScripts(list: SQLQuery[]): Promise<RunResult[]> {
    const result: RunResult[] = [];
    list.forEach((el) => {
      const prep = this.db?.prepare(el.exec);

      const res = prep?.run(el.param);
      if (res) {
        result.push(res);
      }
    });
    return result;
  }

  async disconnect(): Promise<boolean> {
    return true;
  }
}
