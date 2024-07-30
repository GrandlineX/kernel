import express from 'express';
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

export type XActionEvent<G = JwtToken | null> = {
  req: XRequest;
  res: XResponse;
  next: XNextFc;
  data: G;
  extension: IExtensionInterface;
  agent: BaseUserAgent;
};
