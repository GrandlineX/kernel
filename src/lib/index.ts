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

/**
 * Represents a request for validating a JWT token with optional constraints.
 *
 * @template T - The shape of the JWT claims, extending {@link JwtExtend}.
 *
 * This type includes:
 * - **token**: the JWT token to validate.
 * - **requestType**: an array of request type identifiers that the token must satisfy.
 * - **required** (optional): indicates whether the token is mandatory for the request; if omitted, the token is considered required.
 */
export type ValidationRequest<T extends JwtExtend = JwtExtend> = {
  token: JwtToken<T>;
  requestType: string[];
  required?: boolean;
};

export interface ICClient<T extends JwtExtend = JwtExtend>
  extends ICoreCClient {
  /**
   * Assigns the authentication provider responsible for handling authentication operations.
   *
   * @param provider The authentication provider to use.
   * @return True if the provider was set successfully; otherwise, false.
   */
  setAuthProvider(provider: IAuthProvider<T>): boolean;

  /**
   * Verifies a JWT access token and returns the decoded payload or an error code.
   *
   * @param token - The JWT access token string to verify.
   * @return A promise that resolves to the decoded token payload of type {@link JwtToken<T>} if verification succeeds, or a numeric error code if verification fails.
   */
  jwtVerifyAccessToken(token: string): Promise<JwtToken<T> | number>;

  /**
   * Decodes a JWT access token and returns its payload.
   *
   * @param {string} token - The JWT access token to decode.
   * @returns {jwt.JwtPayload | null} The decoded payload if the token is valid, otherwise null.
   */
  jwtDecodeAccessToken(token: string): jwt.JwtPayload | null;

  /**
   * Generates a signed JWT access token.
   *
   * @param {JwtToken<T>} data - The payload data for the token.
   * @param {Record<string, any>} [extend] - Optional additional fields to merge into the token payload.
   * @param {string|number} [expire] - Optional expiration time for the token, expressed in seconds or as an ISO 8601 duration string.
   * @return {Promise<string>} A promise that resolves to the generated JWT token string.
   */
  jwtGenerateAccessToken(
    data: JwtToken<T>,
    extend?: Record<string, any>,
    expire?: string | number,
  ): Promise<string>;

  /**
   * Validates an API token for a specified user and request type.
   *
   * @param {string} username - The username associated with the token.
   * @param {string} token - The API token to validate.
   * @param {string} requestType - The type of request for which the token is being validated.
   * @returns {Promise<{ valid: boolean; userId: string | null }>} A promise that resolves to an object containing a boolean indicating whether the token is valid and the user ID if validation succeeds; otherwise, `null` is returned for the user ID.
   */
  apiTokenValidation(
    username: string,
    token: string,
    requestType: string,
  ): Promise<{ valid: boolean; userId: string | null }>;

  /**
   * Validates user permissions according to the supplied validation request.
   *
   * @param {ValidationRequest<T>} request - The request object containing the necessary
   *   data for permission evaluation, such as user identity, requested action,
   *   and contextual parameters.
   *
   * @return {Promise<boolean>} A promise that resolves to `true` if the permissions
   *   are valid for the specified request, otherwise resolves to `false`.
   */
  permissionValidation(request: ValidationRequest<T>): Promise<boolean>;

  /**
   * Validates the bearer token present in the provided request.
   * @param {XRequest} req - The HTTP request containing the Authorization header.
   * @return {Promise<JwtToken<T> | number>} A promise that resolves to the decoded JWT payload if the token is valid, or a numeric status code (e.g., 401) if validation fails.
   */
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
