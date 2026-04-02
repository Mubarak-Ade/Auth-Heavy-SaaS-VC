import jwt, { type SignOptions } from "jsonwebtoken"

import { env } from "../config/env.js"
import { randomId, randomToken, sha256 } from "../utils/crypto.js"

export interface AccessTokenPayload {
  sub: string
  email: string
  name: string
}

export interface SessionDetails {
  ip?: string
  userAgent?: string
}

export interface RefreshSessionRecord {
  tokenHash: string
  family: string
  expiresAt: Date
  createdAt: Date
  lastUsedAt: Date
  ip?: string
  userAgent?: string
}

export interface IssuedTokens {
  accessToken: string
  refreshToken: string
  session: RefreshSessionRecord
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"]
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload
}

export function parseRefreshToken(rawToken: string): { family: string; secret: string } | null {
  const [family, secret] = rawToken.split(".")

  if (!family || !secret) {
    return null
  }

  return { family, secret }
}

export function createRefreshToken(details: SessionDetails = {}, family = randomId()): IssuedTokens {
  const secret = randomToken()
  const refreshToken = `${family}.${secret}`
  const now = new Date()
  const expiresAt = new Date(now.getTime() + env.refreshTokenDays * 24 * 60 * 60 * 1000)

  return {
    accessToken: "",
    refreshToken,
    session: {
      tokenHash: sha256(refreshToken),
      family,
      createdAt: now,
      lastUsedAt: now,
      expiresAt,
      ip: details.ip,
      userAgent: details.userAgent
    }
  }
}

export function issueTokenPair(
  payload: AccessTokenPayload,
  details: SessionDetails = {},
  family?: string
): IssuedTokens {
  const refreshBundle = createRefreshToken(details, family)

  return {
    accessToken: signAccessToken(payload),
    refreshToken: refreshBundle.refreshToken,
    session: refreshBundle.session
  }
}
