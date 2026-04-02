import type { NextFunction, Request, Response } from "express"

import { verifyAccessToken } from "../services/token.service.js"

export function authenticate(req: Request, res: Response, next: NextFunction): Response | void {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const [, token] = authHeader.split(" ")

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const payload = verifyAccessToken(token)

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    }
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }

  next()
}
