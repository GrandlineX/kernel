import { ILogger } from '../../logger/Logger';

export interface ConfigType {
  c_key: string;
  c_value: string;
}

export interface SQLQuery {
  exec: string;
  param: any[];
}

export interface IBaseDBUpdate {
  update(): Promise<boolean>;

  performe(): Promise<boolean>;

  updateNext(): Promise<boolean>;

  setNext(db: IBaseDBUpdate): void;

  find(version: string): IBaseDBUpdate | null;

  getDb(): IDataBaseConnection;

  getSource(): string;
}

export interface IDataBase<T> extends IDataBaseConnection {
  initNewDB(): Promise<void>;

  getRawDBObject(): T | null;

  configExist(key: string): Promise<boolean>;

  setConfig(key: string, value: string): Promise<boolean>;

  removeConfig(key: string): Promise<void>;

  getConfig(key: string): Promise<ConfigType>;

  execScripts(list: SQLQuery[]): Promise<any[] | null>;
}

export interface IDataBaseConnection extends ILogger {
  setUpdateChain(chain: IBaseDBUpdate): void;

  start(): Promise<void>;

  isConected(): boolean;

  disconnect(): Promise<boolean>;

  setConnected(): void;

  connect(): Promise<boolean>;
}
