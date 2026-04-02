import type { Response } from "express"

export function sendOk<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json(data)
}
