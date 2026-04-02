import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "../lib/api"

export function useInvite(token: string | null) {
  const queryClient = useQueryClient()

  const inviteQuery = useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const { data } = await api.get(`/orgs/invites/${token}`)
      return data as {
        organization: { id: string; name: string; slug: string }
        invite: { email: string; role: "owner" | "admin" | "member" | "viewer"; expiresAt: string }
      }
    },
    enabled: Boolean(token),
    retry: false
  })

  const acceptInviteMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/orgs/invites/accept", { token })
      return data as { success: boolean; orgId: string; role: string }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] })
      await queryClient.invalidateQueries({ queryKey: ["members"] })
    }
  })

  return {
    inviteQuery,
    acceptInviteMutation
  }
}
