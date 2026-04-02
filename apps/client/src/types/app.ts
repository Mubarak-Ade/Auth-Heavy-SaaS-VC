import type { OrgRole } from "@auth-heavy-saas/shared"

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface OrganizationSummary {
  id: string
  name: string
  slug: string
  role: OrgRole
}

export interface DashboardMetrics {
  totalTasks: number
  openTasks: number
  completedTasks: number
  totalNotes: number
}

export interface TaskItem {
  id: string
  orgId: string
  title: string
  description: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  assigneeId: string | null
  createdBy: string
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface NoteItem {
  id: string
  orgId: string
  title: string
  content: string
  visibility: "private" | "org" | "public"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface MemberItem {
  id: string
  userId: string
  name: string
  email: string
  role: OrgRole
  joinedAt: string
}

export interface SessionItem {
  id: string
  family: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
  userAgent?: string
  ip?: string
}
