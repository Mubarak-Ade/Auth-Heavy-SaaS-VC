import { z } from "zod"

export const registerSchema = {
  body: z.object({
    name: z.string().min(1).max(100).trim(),
    email: z.string().email(),
    password: z.string().min(8),
    inviteToken: z.string().min(1).optional()
  })
}

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
}

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email()
  })
}

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8)
  })
}

export const sessionParamsSchema = {
  params: z.object({
    sessionId: z.string().min(1)
  })
}
