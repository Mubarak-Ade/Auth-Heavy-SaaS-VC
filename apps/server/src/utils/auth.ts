import type { CookieOptions, Response } from "express"

import { env, isProduction } from "../config/env.js"

export function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000
  }
}

export function setRefreshCookie(res: Response, rawToken: string): void {
  res.cookie("refreshToken", rawToken, getRefreshCookieOptions())
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie("refreshToken", getRefreshCookieOptions())
}
