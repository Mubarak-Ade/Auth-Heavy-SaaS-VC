import { createContext, useEffect, useMemo, useState } from "react"

import type { AuthContextValue, AuthUser, OrganizationSummary } from "../types/auth"
import { api, setAccessToken } from "../lib/api"

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([])
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function rehydrate() {
    try {
      const [{ data: me }, { data: orgs }] = await Promise.all([
        api.get("/auth/me"),
        api.get("/orgs")
      ])

      setUser(me.user)
      setOrganizations(orgs.items)
      setCurrentOrgId((current) => current ?? orgs.items[0]?.id ?? null)
    } catch {
      setUser(null)
      setOrganizations([])
      setCurrentOrgId(null)
      setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password })
    setAccessToken(data.accessToken)
    setUser(data.user)

    const orgs = await api.get("/orgs")
    setOrganizations(orgs.data.items)
    setCurrentOrgId(orgs.data.items[0]?.id ?? null)
  }

  async function logout() {
    await api.post("/auth/logout")
    setAccessToken(null)
    setUser(null)
    setOrganizations([])
    setCurrentOrgId(null)
  }

  function switchOrganization(orgId: string) {
    setCurrentOrgId(orgId)
  }

  useEffect(() => {
    void rehydrate()
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const currentRole =
      organizations.find((organization) => organization.id === currentOrgId)?.role ?? null

    return {
      user,
      organizations,
      currentOrgId,
      currentRole,
      isLoading,
      login,
      logout,
      rehydrate,
      switchOrganization
    }
  }, [currentOrgId, isLoading, organizations, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
