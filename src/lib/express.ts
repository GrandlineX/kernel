import express from 'express';

export type XRequest = express.Request & {
  rawBody?: string | null;
};
export type XResponse = express.Response;
export type XNextFc = express.NextFunction;
