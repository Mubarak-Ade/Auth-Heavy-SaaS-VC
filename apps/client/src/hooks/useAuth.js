import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth-store";
export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const currentOrgId = useAuthStore((state) => state.currentOrgId);
    const initialized = useAuthStore((state) => state.initialized);
    const setSession = useAuthStore((state) => state.setSession);
    const clearSession = useAuthStore((state) => state.clearSession);
    const setInitialized = useAuthStore((state) => state.setInitialized);
    const setCurrentOrgId = useAuthStore((state) => state.setCurrentOrgId);
    const queryClient = useQueryClient();
    const bootstrapQuery = useQuery({
        queryKey: ["auth", "bootstrap"],
        queryFn: async () => {
            const { data } = await api.post("/auth/refresh");
            return data;
        },
        enabled: !initialized && !accessToken,
        retry: false,
        staleTime: Infinity
    });
    useEffect(() => {
        if (bootstrapQuery.data) {
            setSession(bootstrapQuery.data);
            setInitialized(true);
        }
    }, [bootstrapQuery.data, setInitialized, setSession]);
    useEffect(() => {
        if (bootstrapQuery.isError) {
            clearSession();
            setInitialized(true);
        }
    }, [bootstrapQuery.isError, clearSession, setInitialized]);
    const organizationsQuery = useQuery({
        queryKey: ["organizations"],
        queryFn: async () => {
            const { data } = await api.get("/orgs");
            return data.items;
        },
        enabled: Boolean(user)
    });
    useEffect(() => {
        if (!currentOrgId && organizationsQuery.data?.length) {
            setCurrentOrgId(organizationsQuery.data[0].id);
        }
    }, [currentOrgId, organizationsQuery.data, setCurrentOrgId]);
    const loginMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post("/auth/login", payload);
            return data;
        },
        onSuccess: async (data) => {
            setSession(data);
            setInitialized(true);
            await queryClient.invalidateQueries({ queryKey: ["organizations"] });
        }
    });
    const registerMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post("/auth/register", payload);
            return data;
        },
        onSuccess: async (data) => {
            setSession(data);
            setInitialized(true);
            await queryClient.invalidateQueries({ queryKey: ["organizations"] });
        }
    });
    const forgotPasswordMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post("/auth/forgot-password", payload);
            return data;
        }
    });
    const resetPasswordMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post("/auth/reset-password", payload);
            return data;
        }
    });
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await api.post("/auth/logout");
        },
        onSuccess: async () => {
            clearSession();
            setInitialized(true);
            await queryClient.resetQueries();
        }
    });
    const sessionsQuery = useQuery({
        queryKey: ["auth", "sessions"],
        queryFn: async () => {
            const { data } = await api.get("/auth/sessions");
            return data.items;
        },
        enabled: Boolean(user)
    });
    const revokeSessionMutation = useMutation({
        mutationFn: async (sessionId) => {
            await api.delete(`/auth/sessions/${sessionId}`);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
        }
    });
    const revokeAllSessionsMutation = useMutation({
        mutationFn: async () => {
            await api.delete("/auth/sessions");
        },
        onSuccess: async () => {
            clearSession();
            setInitialized(true);
            await queryClient.resetQueries();
        }
    });
    return {
        user,
        accessToken,
        initialized,
        currentOrgId,
        setCurrentOrgId,
        currentRole: organizationsQuery.data?.find((organization) => organization.id === currentOrgId)?.role ?? null,
        organizations: organizationsQuery.data ?? [],
        organizationsQuery,
        bootstrapQuery,
        sessionsQuery,
        loginMutation,
        registerMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
        logoutMutation,
        revokeSessionMutation,
        revokeAllSessionsMutation,
        isLoadingAuth: !initialized || bootstrapQuery.isLoading
    };
}
