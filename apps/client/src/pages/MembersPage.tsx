import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "../hooks/useAuth"
import { useMemberMutations, useMembersQuery } from "../hooks/useWorkspace"
import { inviteMemberFormSchema, type InviteMemberFormValues } from "../lib/form-schemas"
import { useUiStore } from "../store/ui-store"

export function MembersPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [lastInviteToken, setLastInviteToken] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "member" | "viewer">("all")
  const [sortBy, setSortBy] = useState<"name" | "role">("name")
  const { currentRole } = useAuth()
  const membersQuery = useMembersQuery()
  const { inviteMemberMutation, updateMemberRoleMutation, removeMemberMutation } = useMemberMutations()
  const canManageMembers = currentRole === "owner" || currentRole === "admin"
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      email: "",
      role: "member"
    }
  })

  async function handleInvite(values: InviteMemberFormValues) {
    const result = await inviteMemberMutation.mutateAsync(values)
    setLastInviteToken(result.inviteToken)
    reset()
    pushToast({ title: "Invite created", tone: "success" })
  }

  const filteredMembers = [...(membersQuery.data ?? [])]
    .filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === "all" ? true : member.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((left, right) => {
      if (sortBy === "role") {
        const rank = { owner: 3, admin: 2, member: 1, viewer: 0 }
        return rank[right.role] - rank[left.role]
      }

      return left.name.localeCompare(right.name)
    })

  return (
    <section className="stack">
      <div>
        <h2>Members</h2>
        <p className="muted">Invite teammates, review access, and manage roles.</p>
      </div>

      <div className="card filters-grid">
        <label className="field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" />
        </label>
        <label className="field">
          <span>Role</span>
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as "all" | "owner" | "admin" | "member" | "viewer")
            }
          >
            <option value="all">All</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "name" | "role")}>
            <option value="name">Name</option>
            <option value="role">Role</option>
          </select>
        </label>
      </div>

      {canManageMembers ? (
        <form className="card stack" onSubmit={handleSubmit(handleInvite)}>
          <label className="field">
            <span>Email</span>
            <input {...register("email")} type="email" />
            {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
          </label>
          <label className="field">
            <span>Role</span>
            <select {...register("role")}>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button type="submit" disabled={inviteMemberMutation.isPending}>
            {inviteMemberMutation.isPending ? "Inviting..." : "Send invite"}
          </button>
          {lastInviteToken ? (
            <p className="muted">Latest invite token for testing: <code>{lastInviteToken}</code></p>
          ) : null}
        </form>
      ) : null}

      {membersQuery.isLoading ? <div className="card">Loading members...</div> : null}
      {membersQuery.isError ? <div className="card error-text">Could not load members right now.</div> : null}

      <div className="stack">
        {filteredMembers.map((member) => (
          <article className="card stack" key={member.id}>
            <div>
              <h3>{member.name}</h3>
              <p className="muted">{member.email}</p>
            </div>
            <p>Role: <strong>{member.role}</strong></p>
            {canManageMembers ? (
              <div className="row">
                <select
                  value={member.role}
                  onChange={(event) =>
                    void updateMemberRoleMutation
                      .mutateAsync({
                        memberId: member.id,
                        role: event.target.value as "owner" | "admin" | "member" | "viewer"
                      })
                      .then(() => pushToast({ title: "Member role updated", tone: "success" }))
                  }
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    void removeMemberMutation
                      .mutateAsync(member.id)
                      .then(() => pushToast({ title: "Member removed", tone: "info" }))
                  }
                >
                  Remove
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!filteredMembers.length && !membersQuery.isLoading ? <div className="card">No members match your filters.</div> : null}
      </div>
    </section>
  )
}
