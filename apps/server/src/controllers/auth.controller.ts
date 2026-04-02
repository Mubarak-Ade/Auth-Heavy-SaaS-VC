import type { Request, Response } from "express"

import { clearRefreshCookie, setRefreshCookie } from "../utils/auth.js"
import {
  getCurrentUser,
  listUserSessions,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
  revokeAllSessions,
  revokeSession
} from "../services/auth.service.js"
import { HttpError } from "../utils/http-error.js"

function getSessionDetails(req: Request) {
  return {
    ip: req.ip,
    userAgent: req.get("user-agent")
  }
}

export async function registerController(req: Request, res: Response): Promise<Response> {
  const result = await registerUser(req.body, getSessionDetails(req))
  setRefreshCookie(res, result.refreshToken)
  return res.status(201).json(result)
}

export async function loginController(req: Request, res: Response): Promise<Response> {
  const result = await loginUser(req.body, getSessionDetails(req))
  setRefreshCookie(res, result.refreshToken)
  return res.status(200).json(result)
}

export async function refreshController(req: Request, res: Response): Promise<Response> {
  const rawToken = req.cookies.refreshToken as string | undefined

  if (!rawToken) {
    throw new HttpError(401, "Refresh token is missing")
  }

  const result = await refreshUserSession(rawToken, getSessionDetails(req))
  setRefreshCookie(res, result.refreshToken)

  return res.status(200).json({
    user: result.user,
    accessToken: result.accessToken
  })
}

export async function logoutController(req: Request, res: Response): Promise<Response> {
  await logoutUser(req.cookies.refreshToken as string | undefined)
  clearRefreshCookie(res)
  return res.status(200).json({ success: true })
}

export async function meController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const result = await getCurrentUser(req.user.id)
  return res.status(200).json(result)
}

export async function forgotPasswordController(req: Request, res: Response): Promise<Response> {
  const result = await requestPasswordReset(req.body.email)
  return res.status(200).json(result)
}

export async function resetPasswordController(req: Request, res: Response): Promise<Response> {
  const result = await resetPassword(req.body)
  clearRefreshCookie(res)
  return res.status(200).json(result)
}

export async function listSessionsController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const result = await listUserSessions(req.user.id)
  return res.status(200).json(result)
}

export async function revokeSessionController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : ""
  const result = await revokeSession(req.user.id, sessionId)
  return res.status(200).json(result)
}

export async function revokeAllSessionsController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const result = await revokeAllSessions(req.user.id)
  clearRefreshCookie(res)
  return res.status(200).json(result)
}
