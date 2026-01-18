import express from 'express';
import { ErrorType } from '@grandlinex/swagger-mate';
import {
  BaseUserAgent,
  IExtensionInterface,
  JwtToken,
} from '../classes/index.js';

export type XRequest = express.Request & {
  rawBody?: string | null;
};
export type XResponse = express.Response;
export type XNextFc = express.NextFunction;

export type XPath = Record<string, string>;
export type XQuery = Record<string, string | undefined>;

export type XActionEvent<G = JwtToken | null, B = any> = {
  req: XRequest;
  res: XResponse;
  next: XNextFc;
  data: G;
  path: XPath;
  query: XQuery;
  extension: IExtensionInterface;
  agent: BaseUserAgent;
  body: B;
  sendError: (code: number, error: Partial<ErrorType>) => void;
};
