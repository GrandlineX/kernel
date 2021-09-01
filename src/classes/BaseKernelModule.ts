import {
  BridgeState,
  IBaseBrige,
  IBaseEndpoint,
  IBaseKernelModule,
  IKernel,
} from '../lib';
import BaseAction from './BaseAction';
import Logger from '../modules/logger/Logger';
import BaseService from './BaseService';
import BaseClient from './BaseClient';
import BaseCache from './BaseCache';
import { IDataBase } from '../modules/DBConnector/lib';

export default abstract class BaseKernelModule<
    T extends IDataBase<any> | null,
    P extends BaseClient | null,
    C extends BaseCache | null,
    E extends IBaseEndpoint | null
  >
  extends Logger
  implements IBaseKernelModule<T | null, P | null, C | null, E | null>
{
  private actionlist: BaseAction[];

  private servicelist: BaseService[];

  private deps: string[];

  private srcBridges: IBaseBrige[];

  private tarBridges: IBaseBrige[];

  private readonly kernel: IKernel;

  private db: T | null;

  private client: P | null;

  private cache: C | null;

  private endpoint: E | null;

  private readonly name: string;

  constructor(name: string, kernel: IKernel, ...deps: string[]) {
    super(`${name}Module`, kernel.getGlobalConfig().dir.temp);
    this.name = name;
    this.actionlist = [];
    this.servicelist = [];
    this.kernel = kernel;
    this.db = null;
    this.client = null;
    this.cache = null;
    this.endpoint = null;
    this.srcBridges = [];
    this.tarBridges = [];
    this.deps = deps;
  }

  addSrcBridge(bridge: IBaseBrige): void {
    this.srcBridges.push(bridge);
  }

  addTarBridge(bridge: IBaseBrige): void {
    this.tarBridges.push(bridge);
  }

  abstract startup(): Promise<void>;

  async start(): Promise<void> {
    await this.endpoint?.start();
    await this.startup();
  }

  getEndpoint(): E | null {
    return this.endpoint;
  }

  setEndpoint(endpoint: E | null): void {
    this.endpoint = endpoint;
  }

  getDb(): T | null {
    return this.db;
  }

  setDb(db: T): void {
    this.db = db;
  }

  getClient(): P | null {
    return this.client;
  }

  setClient(client: P): void {
    this.client = client;
  }

  getCache(): C | null {
    return this.cache;
  }

  setCache(cache: C): void {
    this.cache = cache;
  }

  async waitForBridgesReady(): Promise<void> {
    const waitList: Promise<any>[] = [];
    this.srcBridges.forEach((b) =>
      waitList.push(b.waitForState(BridgeState.ready))
    );
    await Promise.all(waitList);
  }

  async waitForBridgesEnd(): Promise<void> {
    const waitList: Promise<any>[] = [];
    this.tarBridges.forEach((b) =>
      waitList.push(b.waitForState(BridgeState.end))
    );
    await Promise.all(waitList);
  }

  notifyBridgesRead(): void {
    this.tarBridges.forEach((b) => b.setState(BridgeState.ready));
  }

  notifyBridgesEnd(): void {
    this.srcBridges.forEach((b) => b.setState(BridgeState.end));
  }

  abstract initModule(): Promise<void>;

  async register(): Promise<void> {
    await this.waitForBridgesReady();
    await this.initModule();
    await this.kernel.trigerFunction('load');
    await this.db?.connect();
    this.actionlist.forEach((el) => {
      el.register();
    });
    this.servicelist.forEach((service) => {
      service.log('Starting');
      service.start();
    });
    this.notifyBridgesRead();
  }

  async shutdown(): Promise<void> {
    await this.waitForBridgesEnd();
    if (this.endpoint) {
      this.endpoint.stop();
    }

    const workload: Promise<any>[] = [];

    this.servicelist.forEach((el) => workload.push(el.stop()));
    await Promise.all(workload);

    await this.db?.disconnect();
    await this.notifyBridgesEnd();
  }

  addAction(action: BaseAction): void {
    this.actionlist.push(action);
  }

  addService(service: BaseService): void {
    this.servicelist.push(service);
  }

  getKernel(): IKernel {
    return this.kernel;
  }

  getName(): string {
    return this.name;
  }

  getDependencyList(): string[] {
    return this.deps;
  }

  getBridges(): IBaseBrige[] {
    return this.srcBridges;
  }
}
