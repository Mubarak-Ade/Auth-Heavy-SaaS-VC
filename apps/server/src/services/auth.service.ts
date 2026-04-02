import bcrypt from "bcryptjs"
import mongoose from "mongoose"

import type { LoginInput, RegisterInput } from "@auth-heavy-saas/shared"

import { OrgMemberModel } from "../models/org-member.model.js"
import { OrganizationModel } from "../models/organization.model.js"
import { UserModel, type SessionSubdocument } from "../models/user.model.js"
import { normalizeEmail } from "../utils/identity.js"
import { slugify } from "../utils/slug.js"
import { HttpError } from "../utils/http-error.js"
import {
  issueTokenPair,
  parseRefreshToken,
  signAccessToken,
  type SessionDetails
} from "./token.service.js"
import { sha256 } from "../utils/crypto.js"

interface ResetPasswordInput {
  token: string
  newPassword: string
}

export interface SerializedUser {
  id: string
  email: string
  name: string
}

function serializeUser(user: { _id: mongoose.Types.ObjectId; email: string; name: string }): SerializedUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  }
}

async function createDefaultOrganization(userId: mongoose.Types.ObjectId, name: string) {
  const baseSlug = slugify(`${name}-workspace`) || `workspace-${userId.toString().slice(-6)}`
  let slug = baseSlug
  let suffix = 1

  while (await OrganizationModel.exists({ slug })) {
    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  const organization = await OrganizationModel.create({
    name: `${name}'s Workspace`,
    slug,
    ownerId: userId
  })

  await OrgMemberModel.create({
    userId,
    orgId: organization._id,
    role: "owner"
  })

  return organization
}

export async function registerUser(input: RegisterInput, sessionDetails: SessionDetails = {}) {
  const email = normalizeEmail(input.email)
  const existingUser = await UserModel.findOne({ email })

  if (existingUser) {
    throw new HttpError(409, "An account with that email already exists")
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await UserModel.create({
    name: input.name.trim(),
    email,
    passwordHash,
    emailVerified: false
  })

  await createDefaultOrganization(user._id, user.name)

  const serializedUser = serializeUser(user)
  const tokens = issueTokenPair(
    { sub: serializedUser.id, email: serializedUser.email, name: serializedUser.name },
    sessionDetails
  )

  user.refreshTokens.push(tokens.session as SessionSubdocument)
  await user.save()

  return {
    user: serializedUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  }
}

export async function loginUser(input: LoginInput, sessionDetails: SessionDetails = {}) {
  const email = normalizeEmail(input.email)
  const user = await UserModel.findOne({ email })

  if (!user) {
    throw new HttpError(401, "Invalid email or password")
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash)

  if (!isValidPassword) {
    throw new HttpError(401, "Invalid email or password")
  }

  user.refreshTokens = user.refreshTokens.filter(
    (session: SessionSubdocument) => session.expiresAt > new Date()
  )

  const serializedUser = serializeUser(user)
  const tokens = issueTokenPair(
    { sub: serializedUser.id, email: serializedUser.email, name: serializedUser.name },
    sessionDetails
  )

  user.refreshTokens.push(tokens.session as SessionSubdocument)
  await user.save()

  return {
    user: serializedUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  }
}

export async function refreshUserSession(rawToken: string, sessionDetails: SessionDetails = {}) {
  const tokenHash = sha256(rawToken)
  const parsedToken = parseRefreshToken(rawToken)
  const user = await UserModel.findOne({
    "refreshTokens.tokenHash": tokenHash
  })

  if (!user) {
    if (parsedToken) {
      const reusedFamilyUser = await UserModel.findOne({
        "refreshTokens.family": parsedToken.family
      })

      if (reusedFamilyUser) {
        reusedFamilyUser.refreshTokens = reusedFamilyUser.refreshTokens.filter(
          (session: SessionSubdocument) => session.family !== parsedToken.family
        )
        await reusedFamilyUser.save()
      }
    }

    throw new HttpError(401, "Invalid refresh token")
  }

  const existingSession = user.refreshTokens.find(
    (session: SessionSubdocument) => session.tokenHash === tokenHash
  )

  if (!existingSession || existingSession.expiresAt <= new Date()) {
    user.refreshTokens = user.refreshTokens.filter(
      (session: SessionSubdocument) => session.tokenHash !== tokenHash
    )
    await user.save()
    throw new HttpError(401, "Refresh token expired")
  }

  user.refreshTokens = user.refreshTokens.filter(
    (session: SessionSubdocument) => session.tokenHash !== tokenHash
  )

  const serializedUser = serializeUser(user)
  const tokens = issueTokenPair(
    { sub: serializedUser.id, email: serializedUser.email, name: serializedUser.name },
    sessionDetails,
    existingSession.family
  )

  user.refreshTokens.push(tokens.session as SessionSubdocument)
  await user.save()

  return {
    user: serializedUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  }
}

export async function logoutUser(rawToken?: string): Promise<void> {
  if (!rawToken) {
    return
  }

  const tokenHash = sha256(rawToken)
  const user = await UserModel.findOne({ "refreshTokens.tokenHash": tokenHash })

  if (!user) {
    return
  }

  user.refreshTokens = user.refreshTokens.filter(
    (session: SessionSubdocument) => session.tokenHash !== tokenHash
  )
  await user.save()
}

export async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId)

  if (!user) {
    throw new HttpError(404, "User not found")
  }

  return {
    user: serializeUser(user)
  }
}

export async function requestPasswordReset(emailAddress: string) {
  const email = normalizeEmail(emailAddress)
  const user = await UserModel.findOne({ email })

  if (!user) {
    return { success: true }
  }

  const rawToken = `${user._id.toString()}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`
  user.resetToken = sha256(rawToken)
  user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)
  await user.save()

  return {
    success: true,
    resetToken: rawToken
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const user = await UserModel.findOne({
    resetToken: sha256(input.token),
    resetTokenExpiry: { $gt: new Date() }
  })

  if (!user) {
    throw new HttpError(400, "Invalid or expired reset token")
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, 12)
  user.resetToken = null
  user.resetTokenExpiry = null
  user.refreshTokens = []
  await user.save()

  return { success: true }
}

export async function listUserSessions(userId: string) {
  const user = await UserModel.findById(userId)

  if (!user) {
    throw new HttpError(404, "User not found")
  }

  return {
    items: user.refreshTokens
      .filter((session: SessionSubdocument) => session.expiresAt > new Date())
      .map((session: SessionSubdocument) => ({
        id: session.tokenHash,
        family: session.family,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent,
        ip: session.ip
      }))
  }
}

export async function revokeSession(userId: string, sessionId: string) {
  const user = await UserModel.findById(userId)

  if (!user) {
    throw new HttpError(404, "User not found")
  }

  user.refreshTokens = user.refreshTokens.filter(
    (session: SessionSubdocument) => session.tokenHash !== sessionId
  )
  await user.save()

  return { success: true }
}

export async function revokeAllSessions(userId: string) {
  const user = await UserModel.findById(userId)

  if (!user) {
    throw new HttpError(404, "User not found")
  }

  user.refreshTokens = []
  await user.save()

  return { success: true }
}

export function createAccessTokenForUser(user: SerializedUser) {
  return signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name
  })
}
