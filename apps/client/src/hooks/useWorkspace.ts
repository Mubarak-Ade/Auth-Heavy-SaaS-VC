import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "../lib/api"
import { useAuth } from "./useAuth"
import type { DashboardMetrics, MemberItem, NoteItem, TaskItem } from "../types/app"

export function useDashboardQuery() {
  const { currentOrgId } = useAuth()

  return useQuery({
    queryKey: ["dashboard", currentOrgId],
    queryFn: async () => {
      const { data } = await api.get(`/orgs/${currentOrgId}/dashboard`)
      return data.metrics as DashboardMetrics
    },
    enabled: Boolean(currentOrgId)
  })
}

export function useTasksQuery() {
  const { currentOrgId } = useAuth()

  return useQuery({
    queryKey: ["tasks", currentOrgId],
    queryFn: async () => {
      const { data } = await api.get(`/orgs/${currentOrgId}/tasks`)
      return data.items as TaskItem[]
    },
    enabled: Boolean(currentOrgId)
  })
}

export function useTaskMutations() {
  const { currentOrgId } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks", currentOrgId] })

  return {
    createTaskMutation: useMutation({
      mutationFn: async (payload: {
        title: string
        description: string
        priority: "low" | "medium" | "high"
      }) => {
        const { data } = await api.post(`/orgs/${currentOrgId}/tasks`, payload)
        return data as TaskItem
      },
      onSuccess: invalidate
    }),
    updateTaskMutation: useMutation({
      mutationFn: async (payload: {
        taskId: string
        patch: Partial<Pick<TaskItem, "status" | "title" | "description" | "priority">>
      }) => {
        const { data } = await api.patch(`/orgs/${currentOrgId}/tasks/${payload.taskId}`, payload.patch)
        return data as TaskItem
      },
      onSuccess: invalidate
    }),
    deleteTaskMutation: useMutation({
      mutationFn: async (taskId: string) => {
        await api.delete(`/orgs/${currentOrgId}/tasks/${taskId}`)
      },
      onSuccess: invalidate
    })
  }
}

export function useNotesQuery() {
  const { currentOrgId } = useAuth()

  return useQuery({
    queryKey: ["notes", currentOrgId],
    queryFn: async () => {
      const { data } = await api.get(`/orgs/${currentOrgId}/notes`)
      return data.items as NoteItem[]
    },
    enabled: Boolean(currentOrgId)
  })
}

export function useNoteMutations() {
  const { currentOrgId } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notes", currentOrgId] })

  return {
    createNoteMutation: useMutation({
      mutationFn: async (payload: {
        title: string
        content: string
        visibility: "private" | "org" | "public"
      }) => {
        const { data } = await api.post(`/orgs/${currentOrgId}/notes`, payload)
        return data as NoteItem
      },
      onSuccess: invalidate
    }),
    updateNoteMutation: useMutation({
      mutationFn: async (payload: {
        noteId: string
        patch: Partial<Pick<NoteItem, "title" | "content" | "visibility">>
      }) => {
        const { data } = await api.patch(`/orgs/${currentOrgId}/notes/${payload.noteId}`, payload.patch)
        return data as NoteItem
      },
      onSuccess: invalidate
    }),
    deleteNoteMutation: useMutation({
      mutationFn: async (noteId: string) => {
        await api.delete(`/orgs/${currentOrgId}/notes/${noteId}`)
      },
      onSuccess: invalidate
    })
  }
}

export function useMembersQuery() {
  const { currentOrgId } = useAuth()

  return useQuery({
    queryKey: ["members", currentOrgId],
    queryFn: async () => {
      const { data } = await api.get(`/orgs/${currentOrgId}/members`)
      return data.items as MemberItem[]
    },
    enabled: Boolean(currentOrgId)
  })
}

export function useMemberMutations() {
  const { currentOrgId } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["members", currentOrgId] })

  return {
    inviteMemberMutation: useMutation({
      mutationFn: async (payload: { email: string; role: "admin" | "member" | "viewer" }) => {
        const { data } = await api.post(`/orgs/${currentOrgId}/invites`, payload)
        return data as { inviteToken: string; email: string; role: string }
      },
      onSuccess: invalidate
    }),
    updateMemberRoleMutation: useMutation({
      mutationFn: async (payload: { memberId: string; role: "owner" | "admin" | "member" | "viewer" }) => {
        const { data } = await api.patch(`/orgs/${currentOrgId}/members/${payload.memberId}/role`, {
          role: payload.role
        })
        return data
      },
      onSuccess: invalidate
    }),
    removeMemberMutation: useMutation({
      mutationFn: async (memberId: string) => {
        await api.delete(`/orgs/${currentOrgId}/members/${memberId}`)
      },
      onSuccess: invalidate
    })
  }
}
