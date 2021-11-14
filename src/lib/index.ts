import express, { Request, Response } from 'express';
import {
  ICoreAction,
  ICoreBridge,
  ICoreCache,
  ICoreCClient,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  ICoreService,
  IDataBase,
} from '@grandlinex/core';
import { BaseClient } from 'classes';
import { IAuthProvider, JwtToken } from '../classes/BaseAuthProvider';

export type ActionTypes = 'POST' | 'GET' | 'USE';

export interface ICClient extends ICoreCClient {
  setAuthProvider(provider: IAuthProvider): boolean;

  jwtVerifyAccessToken(token: string): Promise<JwtToken | null>;

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

export interface IKernel extends ICoreKernel<ICClient> {
  getAppServerPort(): number;

  setAppServerPort(port: number): void;
}

export interface IKernelDb {
  initNewDB(): Promise<void>;

  setKey(secret: string, iv: Buffer, auth: Buffer): Promise<number>;

  getKey(id: number): Promise<KeyType>;

  deleteKey(id: number): Promise<void>;
}

export type IBaseKernelModule<
  T extends IDataBase<any, any> | null,
  P extends BaseClient | null,
  C extends IBaseCache | null,
  E extends IBasePresenter | null
> = ICoreKernelModule<IKernel, T, P, C, E>;

export type IBasePresenter = ICorePresenter<express.Express>;

export interface IBaseAction extends ICoreAction {
  handler(
    req: Request,
    res: Response,
    next: () => void,
    data: JwtToken | null
  ): Promise<void>;
}

export interface KeyType {
  id: number;
  iv: Buffer;
  secret: string;
  auth: Buffer;
}

export type IBaseService = ICoreService;
export type IBaseBrige = ICoreBridge;
export type IBaseCache = ICoreCache;
export type IBaseElement = ICoreElement;
