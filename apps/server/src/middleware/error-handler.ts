import type { NextFunction, Request, Response } from "express"

import { HttpError } from "../utils/http-error.js"

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  const message = error instanceof Error ? error.message : "Internal server error"
  return res.status(500).json({ error: message })
}
