import HttpException from "../common/http-exception";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.statusCode || error.status || 500;

  res.status(status).json(error);
};