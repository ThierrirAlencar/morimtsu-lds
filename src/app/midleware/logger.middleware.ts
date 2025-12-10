import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const date = new Date().toISOString();
    const reqRoute = req.url
    const reqBody = JSON.stringify(req.body)

    console.log(`${date} - ${reqRoute} + body?: ${String(reqBody)}`);
    next();
  }
}