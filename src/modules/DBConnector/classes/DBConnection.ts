import { ILogger } from '../../logger/Logger';
import {
  ConfigType,
  IBaseDBUpdate,
  IDataBaseConnection,
  SQLQuery,
} from '../lib';

export default abstract class DBConnection<T>
  implements ILogger, IDataBaseConnection
{
  logger: ILogger;

  dbversion: string;

  updater: IBaseDBUpdate | null;

  public schemaName: string;

  private conected: boolean;

  constructor(dbversion: string, schemaName: string, logger: ILogger) {
    this.logger = logger;
    this.conected = false;
    this.dbversion = dbversion;
    this.updater = null;
    this.schemaName = schemaName;
    this.debug = this.debug.bind(this);
  }

  setUpdateChain(chain: IBaseDBUpdate): void {
    this.updater = chain;
  }

  async canUpdate(): Promise<boolean> {
    const version = await this.getConfig('dbversion');
    return version.c_value !== this.dbversion;
  }

  async getCurrenDBVersion(): Promise<string> {
    const version = await this.getConfig('dbversion');
    return version.c_value;
  }

  async update(): Promise<boolean> {
    if (this.updater && (await this.canUpdate())) {
      const update = this.updater.find(await this.getCurrenDBVersion());
      if (update) {
        return update.update();
      }
    }
    return true;
  }

  isConected(): boolean {
    return this.conected;
  }

  setConnected(): void {
    this.conected = true;
  }

  async start(): Promise<void> {
    await this.connect();
    if (await this.canUpdate()) {
      await this.update();
    }
  }

  abstract disconnect(): Promise<boolean>;

  abstract connect(): Promise<boolean>;

  abstract execScripts(list: SQLQuery[]): Promise<T[]>;

  abstract getConfig(key: string): Promise<ConfigType>;

  abstract setConfig(key: string, value: string): Promise<boolean>;

  abstract configExist(key: string): Promise<boolean>;

  abstract removeConfig(key: string): Promise<void>;

  debug(...ags: unknown[]): void {
    this.logger.debug(ags);
  }

  error(...ags: unknown[]): void {
    this.logger.error(ags);
  }

  info(...ags: unknown[]): void {
    this.logger.info(ags);
  }

  log(...ags: unknown[]): void {
    this.logger.log(ags);
  }

  verbose(...ags: unknown[]): void {
    this.logger.verbose(ags);
  }

  warn(...ags: unknown[]): void {
    this.logger.warn(ags);
  }
}
