import type { NextFunction, Request, Response } from "express"

import { env } from "../config/env.js"

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (env.nodeEnv === "test") {
    next()
    return
  }

  const startedAt = Date.now()

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt
    console.log(
      `[${req.requestId ?? "unknown"}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    )
  })

  next()
}
