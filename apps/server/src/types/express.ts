import type { OrgRole } from "@auth-heavy-saas/shared"

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface MembershipContext {
  orgId: string
  userId: string
  role: OrgRole
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      membership?: MembershipContext
    }
  }
}
