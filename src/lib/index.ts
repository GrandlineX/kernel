import express, { Request, Response } from 'express';
import { CoreConfig } from '../utils/config';
import { ILogger } from '../modules/logger/Logger';
import { IAuthProvider, JwtToken } from '../classes/BaseAuthProvider';
import { IDataBase } from '../modules/DBConnector/lib';

export type KernelTrigger = 'pre' | 'load' | 'start' | 'stop';

export enum BridgeState {
  'init',
  'ready',
  'end',
}

export type ActionTypes = 'POST' | 'GET' | 'USE';
export type ServiceStates = 'INIT' | 'RUNNING' | 'SLEEPING';

export interface IBaseCache {
  start(): Promise<void>;

  set(key: string, val: string): Promise<void>;

  get(key: string): Promise<string | undefined>;

  delete(key: string): Promise<void>;

  clearAll(key: string): Promise<void>;

  exist(key: string): Promise<boolean>;

  stop(): Promise<void>;
}

export interface ICClient {
  setAuthProvider(provider: IAuthProvider): boolean;
  encrypt(message: string): {
    auth: Buffer;
    iv: Buffer;
    enc: string;
  };

  decrypt(enc: string, iv: Buffer, authTag: Buffer): string;

  isValid(): boolean;

  getHash(seed: string, val: string): string;

  jwtVerifyAccessToken(token: string): Promise<JwtToken | null>;
  generateSecureToken(length: number): Promise<string>;
  jwtGenerateAccessToken(data: { username: string }): string;
  apiTokenValidation(
    username: string,
    token: string,
    requestType: string
  ): Promise<boolean>;

  permissonValidation(token: JwtToken, requestType: string): Promise<boolean>;

  bearerTokenValidation(req: Request): Promise<JwtToken | null>;
  keyStoreSave(data: string): Promise<number>;

  keyStoreLoad(id: number): Promise<string | null>;
}

export interface IKernel extends ILogger {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  setLog(message: string): void;

  getLog(): string;

  setState(message: string): void;

  getState(): string;

  getAppCode(): string;

  getAppName(): string;

  setCryptoClient(crypto: ICClient | null): void;

  getCryptoClient(): ICClient | null;

  hasCryptoClient(): boolean;

  trigerFunction(triger: KernelTrigger): Promise<void>;

  setTrigerFunction(
    trigger: KernelTrigger,
    triggerFunc: (ik: IKernel) => Promise<void>
  ): void;

  getDb(): IDataBase<any> | null;

  addModule(module: IBaseKernelModule<any, any, any, any>): void;

  getModule(): IBaseKernelModule<any, any, any, any>;

  getOffline(): boolean;

  setOffline(mode: boolean): void;

  getMaster(): boolean;

  setMaster(mode: boolean): void;

  getDevMode(): boolean;

  setDevMode(mode: boolean): void;

  getGlobalConfig(): CoreConfig;

  getAppServerPort(): number;
}

export interface IBaseKernelModule<
  T extends IDataBase<any> | null,
  P extends IBaseElement | null,
  C extends IBaseCache | null,
  E extends IBaseEndpoint | null
> extends ILogger {
  addSrcBridge(bridge: IBaseBrige): void;
  addTarBridge(bridge: IBaseBrige): void;
  getBridges(): IBaseBrige[];

  getDependencyList(): string[];

  register(): Promise<void>;

  shutdown(): Promise<void>;

  start(): Promise<void>;

  final?(): Promise<void>;

  startup?(): Promise<void>;

  beforeServiceStart?(): Promise<void>;

  addAction(action: IBaseAction): void;

  addService(service: IBaseService): void;

  getKernel(): IKernel;

  getDb(): T | null;

  setDb(db: T): void;

  getClient(): P | null;

  setClient(client: P): void;

  getEndpoint(): E | null;

  setEndpoint(endpoint: E): void;

  getCache(): C | null;

  setCache(cache: C): void;

  getName(): string;

  getBridgeModule(
    name: string
  ): IBaseKernelModule<any, any, any, any> | undefined;
}

export interface IBaseEndpoint extends IBaseElement {
  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  getApp(): express.Express;
}

export interface IBaseElement extends ILogger {
  getKernel(): IKernel;

  getModule(): IBaseKernelModule<any, any, any, any>;
}

export interface IBaseAction extends IBaseElement {
  register(): void;

  handler(
    req: Request,
    res: Response,
    next: () => void,
    data: JwtToken | null
  ): Promise<void>;
}

export interface IBaseService extends IBaseElement {
  getName(): string;

  start(): Promise<any>;

  stop(): Promise<any>;
}

export interface KeyType {
  id: number;
  iv: Buffer;
  secret: string;
  auth: Buffer;
}

export interface IBaseBrige {
  connect(): void;
  setState(state: BridgeState): void;
  waitForState(state: BridgeState): Promise<boolean>;
  getTarget(): IBaseKernelModule<any, any, any, any>;
}
export type WorkLoad = Promise<any>[];
