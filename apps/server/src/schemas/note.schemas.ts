import { z } from "zod"

export const createNoteSchema = {
  params: z.object({
    orgId: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    content: z.string().max(50000).default(""),
    visibility: z.enum(["private", "org", "public"]).default("private")
  })
}
