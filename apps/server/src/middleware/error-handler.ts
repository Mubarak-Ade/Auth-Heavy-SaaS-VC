import type { NextFunction, Request, Response } from "express"

import { isProduction } from "../config/env.js"
import { HttpError } from "../utils/http-error.js"

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      requestId: req.requestId
    })
  }

  const message = error instanceof Error ? error.message : "Internal server error"

  if (!isProduction) {
    console.error(`[${req.requestId ?? "unknown"}]`, error)
  }

  return res.status(500).json({
    error: isProduction ? "Internal server error" : message,
    requestId: req.requestId
  })
}
