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

export interface AuthContextValue {
  user: AuthUser | null
  organizations: OrganizationSummary[]
  currentOrgId: string | null
  currentRole: OrgRole | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  rehydrate: () => Promise<void>
  switchOrganization: (orgId: string) => void
}
