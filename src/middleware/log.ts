import { NextFunction, Response, Request } from "express";

export const middlewareLogRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
};
