import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
export function useInvite(token) {
    const queryClient = useQueryClient();
    const inviteQuery = useQuery({
        queryKey: ["invite", token],
        queryFn: async () => {
            const { data } = await api.get(`/orgs/invites/${token}`);
            return data;
        },
        enabled: Boolean(token),
        retry: false
    });
    const acceptInviteMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post("/orgs/invites/accept", { token });
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["organizations"] });
            await queryClient.invalidateQueries({ queryKey: ["members"] });
        }
    });
    return {
        inviteQuery,
        acceptInviteMutation
    };
}
