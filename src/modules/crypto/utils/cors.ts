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

export function corsWithOrigins(origins: string[] | '*'): GLXMiddleWare {
  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    if (origins === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      const requestOrigin = req.headers.origin;
      if (requestOrigin && origins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Vary', 'Origin');
      }
    }
    next();
  };
}
