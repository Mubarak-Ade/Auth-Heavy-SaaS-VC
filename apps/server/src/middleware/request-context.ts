import type { NextFunction, Request, Response } from "express"

import { randomId } from "../utils/crypto.js"

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header("x-request-id") || randomId()

  req.requestId = requestId
  res.setHeader("x-request-id", requestId)

  next()
}
