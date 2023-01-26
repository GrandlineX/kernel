import { XNextFc, XRequest, XResponse } from '../../../lib/express';

export type CorsMiddleWare = (
  req: XRequest,
  res: XResponse,
  next: XNextFc
) => void;

export const cors: CorsMiddleWare = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
};
