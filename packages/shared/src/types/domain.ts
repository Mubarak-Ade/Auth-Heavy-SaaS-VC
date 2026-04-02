import { z } from "zod"

import { orgRoles } from "../constants/roles.js"

export const orgPlanSchema = z.enum(["free", "pro", "enterprise"])
export const orgRoleSchema = z.enum(orgRoles)
export const taskStatusSchema = z.enum(["todo", "in_progress", "done"])
export const taskPrioritySchema = z.enum(["low", "medium", "high"])
export const noteVisibilitySchema = z.enum(["private", "org", "public"])

export type OrgPlan = z.infer<typeof orgPlanSchema>
export type OrgRole = z.infer<typeof orgRoleSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type NoteVisibility = z.infer<typeof noteVisibilitySchema>
