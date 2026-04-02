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

export const noteParamsSchema = {
  params: z.object({
    orgId: z.string().min(1),
    noteId: z.string().min(1)
  })
}

export const updateNoteSchema = {
  params: z.object({
    orgId: z.string().min(1),
    noteId: z.string().min(1)
  }),
  body: z
    .object({
      title: z.string().min(1).max(200).trim().optional(),
      content: z.string().max(50000).optional(),
      visibility: z.enum(["private", "org", "public"]).optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    })
}
