import * as log from 'electron-log';
import Path from 'path';

export interface ILogger {
  log(...ags: unknown[]): void;

  debug(...ags: unknown[]): void;

  info(...ags: unknown[]): void;

  error(...ags: unknown[]): void;

  warn(...ags: unknown[]): void;

  verbose(...ags: unknown[]): void;
}

export default abstract class Logger implements ILogger {
  logger: log.LogFunctions;

  constructor(scope: string, path: string) {
    log.transports.file.resolvePath = () => Path.join(path, 'main.log');
    this.logger = log.scope(scope);
    let logLevel: any = null;
    switch (process.env.DLOG_LEVEL) {
      case 'error':
      case 'warn':
      case 'info':
      case 'verbose':
      case 'debug':
        logLevel = process.env.LOG_LEVEL;
        break;
      case 'false':
        logLevel = false;
        break;
      default:
    }
    if (logLevel !== null) {
      log.transports.console.level = logLevel;
      log.transports.file.level = logLevel;
    }

    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.verbose = this.verbose.bind(this);
  }

  log(...ags: unknown[]): void {
    this.logger.log(ags);
  }

  debug(...ags: unknown[]): void {
    this.logger.debug(ags);
  }

  info(...ags: unknown[]): void {
    this.logger.info(ags);
  }

  error(...ags: unknown[]): void {
    this.logger.error(ags);
  }

  warn(...ags: unknown[]): void {
    this.logger.warn(ags);
  }

  verbose(...ags: unknown[]): void {
    this.logger.verbose(ags);
  }
}
