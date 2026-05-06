import { XNextFc, XRequest, XResponse } from '../../../lib/express.js';

export type GLXMiddleWare = (
  req: XRequest,
  res: XResponse,
  next: XNextFc,
) => void;

export const cors: GLXMiddleWare = (_, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
};
