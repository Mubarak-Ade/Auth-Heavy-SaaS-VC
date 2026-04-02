import { create } from "zustand"

import type { AuthUser } from "../types/app"

interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
  currentOrgId: string | null
  initialized: boolean
  setSession: (payload: { user: AuthUser; accessToken: string }) => void
  clearSession: () => void
  setCurrentOrgId: (orgId: string | null) => void
  setInitialized: (value: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  currentOrgId: null,
  initialized: false,
  setSession: ({ user, accessToken }) => set({ user, accessToken }),
  clearSession: () => set({ user: null, accessToken: null, currentOrgId: null }),
  setCurrentOrgId: (currentOrgId) => set({ currentOrgId }),
  setInitialized: (initialized) => set({ initialized })
}))
