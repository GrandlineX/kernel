import { ILogger } from '../../logger/Logger';
import { IBaseDBUpdate, IDataBaseConnection } from '../lib';

export default abstract class DBConnection
  implements ILogger, IDataBaseConnection
{
  logger: ILogger;

  dbversion: string;

  updater: IBaseDBUpdate | null;

  private conected: boolean;

  constructor(dbversion: string, logger: ILogger) {
    this.logger = logger;
    this.conected = false;
    this.dbversion = dbversion;
    this.updater = null;
    this.debug = this.debug.bind(this);
  }

  abstract disconnect(): Promise<boolean>;

  setUpdateChain(chain: IBaseDBUpdate) {
    this.updater = chain;
  }

  isConected(): boolean {
    return this.conected;
  }

  setConnected() {
    this.conected = true;
  }

  abstract connect(run: (process: string) => Promise<void>): Promise<boolean>;

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
