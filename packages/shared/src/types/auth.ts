import { z } from "zod"

export const registerInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  password: z.string().min(8)
})

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export type RegisterInput = z.infer<typeof registerInputSchema>
export type LoginInput = z.infer<typeof loginInputSchema>
