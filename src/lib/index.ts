import {
  ICoreAction,
  ICoreBridge,
  ICoreCache,
  ICoreCClient,
  ICoreClient,
  ICoreElement,
  ICoreKernel,
  ICoreKernelModule,
  ICorePresenter,
  ICoreService,
  IDataBase,
} from '@grandlinex/core';
import express from 'express';

import * as jwt from 'jsonwebtoken';
import { IAuthProvider, JwtExtend, JwtToken } from '../classes/index.js';

import { XActionEvent, XRequest } from './express.js';

export type ActionTypes = 'POST' | 'GET' | 'USE' | 'PATCH' | 'DELETE';

export interface ICClient<T extends JwtExtend = JwtExtend>
  extends ICoreCClient {
  setAuthProvider(provider: IAuthProvider<T>): boolean;

  jwtVerifyAccessToken(token: string): Promise<JwtToken<T> | number>;

  jwtDecodeAccessToken(token: string): jwt.JwtPayload | null;

  jwtGenerateAccessToken(
    data: JwtToken<T>,
    extend?: Record<string, any>,
    expire?: string | number,
  ): Promise<string>;

  apiTokenValidation(
    username: string,
    token: string,
    requestType: string,
  ): Promise<{ valid: boolean; userId: string | null }>;

  permissionValidation(
    token: JwtToken<T>,
    requestType: string,
  ): Promise<boolean>;

  bearerTokenValidation(req: XRequest): Promise<JwtToken<T> | number>;
}

export interface IKernel<T extends JwtExtend = JwtExtend>
  extends ICoreKernel<ICClient<T>> {
  getAppServerPort(): number;
  getApiVersion(): number;
  setAppServerPort(port: number): void;
  responseCodeFunction(data: { code: number; req: XRequest }): void;
}

export type IBaseKernelModule<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any,
> = ICoreKernelModule<K, T, P, C, E>;

export type IBasePresenter = ICorePresenter<express.Express>;

export type IBaseService<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any,
> = ICoreService<K, T, P, C, E>;
export type IBaseClient<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  K extends IKernel = IKernel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends IDataBase<any, any> | null = any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  P extends IBaseClient | null = any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  C extends IBaseCache | null = any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  E extends IBasePresenter | null = any,
> = ICoreClient;
export type IBaseBrige = ICoreBridge;
export type IBaseCache<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any,
> = ICoreCache<K, T, P, C, E>;
export type IBaseElement<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any,
> = ICoreElement<K, T, P, C, E>;

export interface IBaseAction<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any,
> extends ICoreAction<K, T, P, C, E> {
  handler(event: XActionEvent): Promise<void>;
}
