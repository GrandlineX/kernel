import type {
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
import type { StringValue } from 'ms';
import type { XActionEvent, XRequest, XResponse } from './express';
import { BaseKernelMetric } from '../classes/BaseKernelMetric';

export type JwtToken = {
  username: string;
  type: 'token' | 'refresh';
} & jwt.JwtPayload;

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
export type ValidationRequest = {
  token: JwtToken;
  requestType: string[];
  required?: boolean;
};

export type TokAuthValidationRequest =
  | {
      username: string;
      password: string;
      top?: string;
      requestType: 'api';
    }
  | {
      refresh: JwtToken;
      requestType: 'refresh';
    };

export type TokenData = {
  token: string;
  refresh?: string;
};
export type AuthResult = {
  valid: boolean;
  userId: string | null;
};

export interface ICClient extends ICoreCClient {
  /**
   * Verifies a JWT access token and returns the decoded payload or an error code.
   *
   * @param token - The JWT access token string to verify.
   * @return A promise that resolves to the decoded token payload of type {@link JwtToken<T>} if verification succeeds, or a numeric error code if verification fails.
   */
  jwtVerifyAccessToken(token: string): Promise<JwtToken | number>;

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
   * @param {JwtToken} data - The payload data for the token.
   * @param {string|number} [expire] - Optional expiration time for the token, expressed in seconds or as an ISO 8601 duration string.
   * @return {Promise<string>} A promise that resolves to the generated JWT token string.
   */
  jwtGenerateAccessToken(
    data: JwtToken,
    expire?: 'default' | 'refresh' | StringValue | number,
  ): Promise<string>;

  /**
   * Validates an API token for a specified user and request type.
   *
   * @returns {Promise<AuthResult>} A promise that resolves to an object containing a boolean indicating whether the token is valid and the user ID if validation succeeds; otherwise, `null` is returned for the user ID.
   * @param request
   */
  apiTokenValidation(request: TokAuthValidationRequest): Promise<AuthResult>;

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
  permissionValidation(request: ValidationRequest): Promise<boolean>;

  /**
   * Validates the bearer token present in the provided request.
   * @param {XRequest} req - The HTTP request containing the Authorization header.
   * @return {Promise<JwtToken<T> | number>} A promise that resolves to the decoded JWT payload if the token is valid, or a numeric status code (e.g., 401) if validation fails.
   */
  bearerTokenValidation(req: XRequest): Promise<JwtToken | number>;

  /**
   * Generates a token for the specified user.
   *
   * @param {string} userID - The unique identifier of the user.
   * @param {string} userName - The display name of the user.
   * @param {boolean} refresh - Indicates whether a refresh token should be issued.
   * @param {string} [jti] - Optional JWT ID to correlate tokens.
   * @returns {Promise<TokenData>} A promise that resolves with the generated token and, if requested, a refresh token.
   */
  generateToken(
    userID: string,
    userName: string,
    refresh: boolean,
    jti?: string,
  ): Promise<TokenData>;

  /**
   * Sets an authentication cookie on the given response using the provided token data.
   *
   * @param req - The XResponse object on which the cookie will be set.
   * @param data - The TokenData containing the information to store in the cookie.
   * @returns {Promise<void>} A promise that resolves when the cookie has been set successfully.
   */
  setCookie(req: XResponse, data: TokenData): Promise<void>;

  /**
   * Generates a refresh token for the provided JWT token.
   *
   * @param token The JWT token for which a refresh token should be generated.
   * @return A promise that resolves to the new {@link TokenData} object or {@code null} if the token cannot be refreshed. */
  generateRefreshToken(token: JwtToken): Promise<TokenData | null>;
}

export interface IKernel extends ICoreKernel<ICClient> {
  getAppServerPort(): number;
  getApiVersion(): number;
  setAppServerPort(port: number): void;
  getMetric(): BaseKernelMetric<any> | null;
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
