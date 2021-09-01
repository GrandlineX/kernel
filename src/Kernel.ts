import {
  IBaseKernelModule,
  ICClient,
  IKernel,
  KernelTrigger,
  PGConfig,
} from './lib';
import BaseKernelModule from './classes/BaseKernelModule';
import KernelModule from './KernelModule';
import {
  CoreConfig,
  createCertsIfNotExist,
  createFolderIfNotExist,
  getConfig,
} from './utils';
import KernelDB from './database/KernelDB';
import Logger from './modules/logger/Logger';
import initHandler from './utils/initHandler';
import { CryptoClient } from './modules';

/**
 *  @class Kernel
 */

export default class Kernel extends Logger implements IKernel {
  private master: boolean;

  private devMode: boolean;

  private expressPort: number;

  private appCode: string;

  private appName: string;

  private appVersion: string;

  private cryptoClient: ICClient | null;

  private state: any = null;

  private logM: string;

  private moduleList: IBaseKernelModule<any, any, any, any>[];

  private kernelModule: KernelModule;

  private offline: boolean;

  private pgConf: PGConfig | null;

  private updateSkip: boolean;

  private globalConfig: CoreConfig;

  private preRun?: (kernel: IKernel) => Promise<void>;

  private startRun?: (kernel: IKernel) => Promise<void>;

  private stopRun?: (kernel: IKernel) => Promise<void>;

  private loadRun?: (kernel: IKernel) => Promise<void>;

  /**
   * Default Constructor
   * @param appName App Name
   * @param appCode App Code (Only lower case)
   * @param domain set the external endpoint
   * @param pathOverride set base path for config folder
   * @param portOverride overwrites the default port
   */
  constructor(
    appName: string,
    appCode: string,
    pathOverride?: string,
    portOverride?: number
  ) {
    super('kernel', getConfig(appName, pathOverride).dir.temp);
    this.appName = appName;
    this.devMode = false;
    this.appCode = appCode;
    this.logM = 'Process Starting';
    this.cryptoClient = null;
    this.moduleList = [];
    this.offline = false;
    this.updateSkip = false;
    this.appVersion = 'noVersion';
    this.pgConf = null;
    this.master = true;
    this.trigerFunction = this.trigerFunction.bind(this);
    if (pathOverride) {
      this.debug(`use custiom config path @ ${pathOverride}`);
    }
    if (portOverride) {
      this.debug(`use custiom api port @ ${portOverride}`);
      this.expressPort = portOverride;
    } else {
      this.expressPort = 9257;
    }
    this.globalConfig = {
      ...getConfig(appName, pathOverride),
      net: {
        port: this.expressPort,
        domain: 'http://localhost',
      },
    };
    this.kernelModule = new KernelModule(this);
    this.setState('init');
  }

  getAppServerPort(): number {
    return this.expressPort;
  }

  setAppServerPort(port: number): void {
    this.expressPort = port;
  }

  getMaster(): boolean {
    return this.master;
  }

  setMaster(mode: boolean): void {
    this.master = mode;
  }

  getModule(): IBaseKernelModule<any, any, any, any> {
    return this.kernelModule;
  }

  getAppName(): string {
    return this.appName;
  }

  getAppCode(): string {
    return this.appCode;
  }

  getPGConf(): PGConfig | null {
    return this.pgConf;
  }

  public async start(): Promise<boolean> {
    this.log(
      `Start Kernel v${process.env.npm_package_version} ${
        this.devMode ? 'DEV' : 'Prod'
      }`
    );
    this.log('Run startup script');
    this.preloadSetup();
    await this.trigerFunction('pre');
    this.log('Startup script complete');
    this.log('Run launcher');
    await this.startUp();
    this.setState('running');
    return true;
  }

  async trigerFunction(triger: KernelTrigger): Promise<void> {
    switch (triger) {
      case 'pre':
        if (this.preRun) {
          await this.preRun(this);
        }
        break;
      case 'start':
        if (this.startRun) {
          await this.startRun(this);
        }
        break;
      case 'stop':
        if (this.stopRun) {
          await this.stopRun(this);
        }
        break;
      case 'load':
        if (this.loadRun) {
          await this.loadRun(this);
        }
        break;
      default:
        throw new Error('Method not implemented.');
    }
  }

  setTrigerFunction(
    trigger: KernelTrigger,
    triggerFunc: (ik: IKernel) => Promise<void>
  ): void {
    switch (trigger) {
      case 'pre':
        this.preRun = triggerFunc;
        break;
      case 'start':
        this.startRun = triggerFunc;
        break;
      case 'stop':
        this.stopRun = triggerFunc;
        break;
      case 'load':
        this.loadRun = triggerFunc;
        break;
      default:
        throw new Error('Method not implemented.');
    }
  }

  setLog(message: string) {
    this.logM = message;
  }

  getLog(): string {
    return this.logM;
  }

  setState(message: string) {
    this.state = message;
  }

  getState(): string {
    return this.state;
  }

  setCryptoClient(crypto: ICClient | null) {
    this.cryptoClient = crypto;
  }

  getCryptoClient(): ICClient | null {
    return this.cryptoClient;
  }

  hasCryptoClient(): boolean {
    return this.cryptoClient !== null;
  }

  getDb(): KernelDB | null {
    return this.kernelModule.getDb();
  }

  /**
   * @deprecated The method should not be used
   */
  getModuleList(): IBaseKernelModule<any, any, any, any>[] {
    return this.moduleList;
  }

  getOffline() {
    return this.offline;
  }

  setOffline(mode: boolean) {
    this.offline = mode;
  }

  getGlobalConfig() {
    return this.globalConfig;
  }

  getDevMode(): boolean {
    return this.devMode;
  }

  setDevMode(mode: boolean): void {
    this.devMode = mode;
  }

  addModule(module: BaseKernelModule<any, any, any, any>): void {
    this.moduleList.push(module);
  }

  async stop(): Promise<boolean> {
    const workload: Promise<void>[] = [];
    await this.trigerFunction('stop');
    this.getModuleList().forEach((el) => workload.push(el.shutdown()));
    await Promise.all(workload);
    await this.getModule().shutdown();
    this.setState('exited');
    return true;
  }

  getChildModule(
    modName: string
  ): IBaseKernelModule<any, any, any, any> | null {
    const mod = this.moduleList.find((mo) => mo.getName() === modName);
    if (mod) {
      return mod;
    }
    return null;
  }

  private preloadSetup() {
    const config = this.getGlobalConfig();
    const { root, data, db, temp, certs } = config.dir;
    const { env } = process;

    if (
      !(
        createFolderIfNotExist(root) &&
        createFolderIfNotExist(data) &&
        createFolderIfNotExist(db) &&
        createFolderIfNotExist(certs) &&
        createFolderIfNotExist(temp)
      )
    ) {
      console.error(`Cant create config folder at ${root}`);
      process.exit(1);
    }
    if (env?.npm_package_version) {
      this.appVersion = env.npm_package_version;
    }
    if (
      env?.DBPATH &&
      env?.DBPORT &&
      env?.POSTGRES_PASSWORD &&
      env?.POSTGRES_USER
    ) {
      this.pgConf = {
        host: env.DBPATH,
        port: Number(env.DBPORT),
        password: env.POSTGRES_PASSWORD,
        user: env.POSTGRES_USER,
      };
    }
    if (env?.SERVER_PASSWOR) {
      this.debug('enable crypto client');
      const cc = CryptoClient.fromPW(env.SERVER_PASSWOR, this);
      this.setCryptoClient(cc);
    }

    if (env?.PUBLICDOMAIN) {
      this.debug(`set server domain ${env.PUBLICDOMAIN}`);
      this.globalConfig.net.domain = env.PUBLICDOMAIN;
    }
    createCertsIfNotExist(config);
  }

  private async startUp() {
    await this.getModule().register();
    await initHandler(this.moduleList, this);
    await this.getModule().start();
    for (const mod of this.moduleList) {
      if (mod.final !== undefined) {
        await mod.final();
      }
    }
    await this.trigerFunction('start');
  }
}
