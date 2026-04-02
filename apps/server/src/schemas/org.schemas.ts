import { z } from "zod"

export const createOrgSchema = {
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    slug: z.string().min(2).max(100).trim()
  })
}

export const orgParamsSchema = {
  params: z.object({
    orgId: z.string().min(1)
  })
}

export const inviteMemberSchema = {
  params: z.object({
    orgId: z.string().min(1)
  }),
  body: z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member", "viewer"])
  })
}

export const acceptInviteSchema = {
  body: z.object({
    token: z.string().min(1)
  })
}

export const memberParamsSchema = {
  params: z.object({
    orgId: z.string().min(1),
    memberId: z.string().min(1)
  })
}

export const updateMemberRoleSchema = {
  params: z.object({
    orgId: z.string().min(1),
    memberId: z.string().min(1)
  }),
  body: z.object({
    role: z.enum(["owner", "admin", "member", "viewer"])
  })
}
