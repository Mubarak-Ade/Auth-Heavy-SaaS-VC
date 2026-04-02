import { z } from "zod"

export const createTaskSchema = {
  params: z.object({
    orgId: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(5000).optional(),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional().default([])
  })
}
