import { Request } from "express"
export interface RequestWithJwt extends Request {
  jwt: string | boolean;
}