import DBConnection from '../classes/DBConnection';
import { IBaseDBUpdate } from '../lib';

export default abstract class BaseDBUpdate<T> implements IBaseDBUpdate {
  srcVersion: string;

  tarVersion: string;

  private readonly db: DBConnection<T>;

  private nextUpdate: BaseDBUpdate<T> | null;

  protected constructor(
    srcVersion: string,
    tarVersion: string,
    db: DBConnection<T>
  ) {
    this.srcVersion = srcVersion;
    this.tarVersion = tarVersion;
    this.db = db;
    this.nextUpdate = null;
  }

  async update(): Promise<boolean> {
    const perf = await this.performe();
    if (perf) {
      this.db.log(
        `Update DB from ${this.srcVersion} to ${this.tarVersion} successful`
      );
    } else {
      throw new Error(
        `Updating DB from ${this.srcVersion} to ${this.tarVersion} failed`
      );
    }
    const next = await this.updateNext();

    return perf && next;
  }

  abstract performe(): Promise<boolean>;

  async updateNext(): Promise<boolean> {
    if (this.nextUpdate !== null) {
      return this.nextUpdate.update();
    }
    return true;
  }

  setNext(db: BaseDBUpdate<T>): void {
    this.nextUpdate = db;
  }

  find(version: string): BaseDBUpdate<T> | null {
    if (this.srcVersion === version) {
      return this;
    }
    if (this.nextUpdate !== null) {
      return this.nextUpdate.find(version);
    }
    return null;
  }

  getDb(): DBConnection<T> {
    return this.db;
  }

  getSource(): string {
    return this.srcVersion;
  }
}
