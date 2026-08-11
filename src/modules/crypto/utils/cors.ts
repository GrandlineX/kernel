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

export function buildCors(
  allowedOrigins: string[] | '*' = '*',
  allowedHeaders: string[] | '*' = '*',
): GLXMiddleWare {
  return (req, res, next) => {
    const { origin } = req.headers;
    if (
      origin &&
      allowedOrigins !== '*' &&
      allowedOrigins.some((value) => origin.endsWith(value))
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    if (allowedHeaders !== '*') {
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    } else {
      res.setHeader('Access-Control-Allow-Headers', '*');
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    next();
  };
}
