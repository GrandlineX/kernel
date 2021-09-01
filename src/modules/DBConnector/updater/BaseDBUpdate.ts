import DBConnection from '../classes/DBConnection';
import { IBaseDBUpdate } from '../lib';

export default abstract class BaseDBUpdate implements IBaseDBUpdate {
  srcVersion: string;

  tarVersion: string;

  private db: DBConnection;

  private nextUpdate: BaseDBUpdate | null;

  constructor(srcVersion: string, tarVersion: string, db: DBConnection) {
    this.srcVersion = srcVersion;
    this.tarVersion = tarVersion;
    this.db = db;
    this.nextUpdate = null;
  }

  async update(): Promise<boolean> {
    const perf = await this.performe();
    const next = await this.updateNext();

    const result = perf && next;
    if (result) {
      this.db.log(
        `Update DB from ${this.srcVersion} to ${this.tarVersion} successful`
      );
    }
    return result;
  }

  abstract performe(): Promise<boolean>;

  async updateNext(): Promise<boolean> {
    if (this.nextUpdate !== null) {
      return this.nextUpdate.update();
    }
    return true;
  }

  setNext(db: BaseDBUpdate): void {
    this.nextUpdate = db;
  }

  find(version: string): BaseDBUpdate | null {
    if (this.srcVersion === version) {
      return this;
    }
    if (this.nextUpdate !== null) {
      return this.nextUpdate.find(version);
    }
    return null;
  }

  getDb() {
    return this.db;
  }

  getSource() {
    return this.srcVersion;
  }
}
