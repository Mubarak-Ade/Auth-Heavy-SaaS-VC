import { create } from "zustand";
export const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    currentOrgId: null,
    initialized: false,
    setSession: ({ user, accessToken }) => set({ user, accessToken }),
    clearSession: () => set({ user: null, accessToken: null, currentOrgId: null }),
    setCurrentOrgId: (currentOrgId) => set({ currentOrgId }),
    setInitialized: (initialized) => set({ initialized })
}));
