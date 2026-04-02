import { z } from "zod"

export const createOrgSchema = {
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    slug: z.string().min(2).max(100).trim()
  })
}
