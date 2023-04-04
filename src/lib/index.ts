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
import {
  IAuthProvider,
  JwtToken,
  IExtensionInterface,
} from '../classes/index.js';

import { XNextFc, XRequest, XResponse } from './express.js';

export type ActionTypes = 'POST' | 'GET' | 'USE' | 'PATCH' | 'DELETE';

export interface ICClient extends ICoreCClient {
  setAuthProvider(provider: IAuthProvider): boolean;

  jwtVerifyAccessToken(token: string): Promise<JwtToken | number>;

  jwtDecodeAccessToken(token: string): jwt.JwtPayload | null;

  jwtGenerateAccessToken(data: JwtToken, expire?: string | number): string;

  apiTokenValidation(
    username: string,
    token: string,
    requestType: string
  ): Promise<{ valid: boolean; userId: string | null }>;

  permissionValidation(token: JwtToken, requestType: string): Promise<boolean>;

  bearerTokenValidation(req: XRequest): Promise<JwtToken | number>;
}

export interface IKernel extends ICoreKernel<ICClient> {
  getAppServerPort(): number;
  setAppServerPort(port: number): void;
  responseCodeFunction(data: { code: number; req: XRequest }): void;
}

export type IBaseKernelModule<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any
> = ICoreKernelModule<K, T, P, C, E>;

export type IBasePresenter = ICorePresenter<express.Express>;

export type IBaseService<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any
> = ICoreService<K, T, P, C, E>;
export type IBaseClient<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any
> = ICoreClient;
export type IBaseBrige = ICoreBridge;
export type IBaseCache<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any
> = ICoreCache<K, T, P, C, E>;
export type IBaseElement<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any
> = ICoreElement<K, T, P, C, E>;

export interface IBaseAction<
  K extends IKernel = IKernel,
  T extends IDataBase<any, any> | null = any,
  P extends IBaseClient | null = any,
  C extends IBaseCache | null = any,
  E extends IBasePresenter | null = any
> extends ICoreAction<K, T, P, C, E> {
  handler(
    req: XRequest,
    res: XResponse,
    next: XNextFc,
    data: JwtToken | null,
    extension: IExtensionInterface
  ): Promise<void>;
}
