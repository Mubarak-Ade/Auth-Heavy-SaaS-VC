import { useEffect } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "../lib/api"
import { useAuthStore } from "../store/auth-store"
import type { OrganizationSummary, SessionItem } from "../types/app"

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const currentOrgId = useAuthStore((state) => state.currentOrgId)
  const initialized = useAuthStore((state) => state.initialized)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const setCurrentOrgId = useAuthStore((state) => state.setCurrentOrgId)
  const queryClient = useQueryClient()

  const bootstrapQuery = useQuery({
    queryKey: ["auth", "bootstrap"],
    queryFn: async () => {
      const { data } = await api.post("/auth/refresh")
      return data as { user: { id: string; email: string; name: string }; accessToken: string }
    },
    enabled: !initialized && !accessToken,
    retry: false,
    staleTime: Infinity
  })

  useEffect(() => {
    if (bootstrapQuery.data) {
      setSession(bootstrapQuery.data)
      setInitialized(true)
    }
  }, [bootstrapQuery.data, setInitialized, setSession])

  useEffect(() => {
    if (bootstrapQuery.isError) {
      clearSession()
      setInitialized(true)
    }
  }, [bootstrapQuery.isError, clearSession, setInitialized])

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await api.get("/orgs")
      return data.items as OrganizationSummary[]
    },
    enabled: Boolean(user)
  })

  useEffect(() => {
    if (!currentOrgId && organizationsQuery.data?.length) {
      setCurrentOrgId(organizationsQuery.data[0].id)
    }
  }, [currentOrgId, organizationsQuery.data, setCurrentOrgId])

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post("/auth/login", payload)
      return data as { user: { id: string; email: string; name: string }; accessToken: string }
    },
    onSuccess: async (data) => {
      setSession(data)
      setInitialized(true)
      await queryClient.invalidateQueries({ queryKey: ["organizations"] })
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout")
    },
    onSuccess: async () => {
      clearSession()
      setInitialized(true)
      await queryClient.resetQueries()
    }
  })

  const sessionsQuery = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: async () => {
      const { data } = await api.get("/auth/sessions")
      return data.items as SessionItem[]
    },
    enabled: Boolean(user)
  })

  return {
    user,
    accessToken,
    initialized,
    currentOrgId,
    setCurrentOrgId,
    currentRole:
      organizationsQuery.data?.find((organization) => organization.id === currentOrgId)?.role ?? null,
    organizations: organizationsQuery.data ?? [],
    organizationsQuery,
    bootstrapQuery,
    sessionsQuery,
    loginMutation,
    logoutMutation,
    isLoadingAuth: !initialized || bootstrapQuery.isLoading
  }
}
