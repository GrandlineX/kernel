import { NextFunction, Request, Response } from 'express';

export type CorsMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export const cors: CorsMiddleWare = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
};
