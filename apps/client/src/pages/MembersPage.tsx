import { FormEvent, useState } from "react"

import { useAuth } from "../hooks/useAuth"
import { useMemberMutations, useMembersQuery } from "../hooks/useWorkspace"

export function MembersPage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member")
  const [lastInviteToken, setLastInviteToken] = useState<string | null>(null)
  const { currentRole } = useAuth()
  const membersQuery = useMembersQuery()
  const { inviteMemberMutation, updateMemberRoleMutation, removeMemberMutation } = useMemberMutations()
  const canManageMembers = currentRole === "owner" || currentRole === "admin"

  async function handleInvite(event: FormEvent) {
    event.preventDefault()
    const result = await inviteMemberMutation.mutateAsync({ email, role })
    setLastInviteToken(result.inviteToken)
    setEmail("")
    setRole("member")
  }

  return (
    <section className="stack">
      <div>
        <h2>Members</h2>
        <p className="muted">Invite teammates, review access, and manage roles.</p>
      </div>

      {canManageMembers ? (
        <form className="card stack" onSubmit={handleInvite}>
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as "admin" | "member" | "viewer")}>
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

      <div className="stack">
        {membersQuery.data?.map((member) => (
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
                    void updateMemberRoleMutation.mutateAsync({
                      memberId: member.id,
                      role: event.target.value as "owner" | "admin" | "member" | "viewer"
                    })
                  }
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button type="button" onClick={() => void removeMemberMutation.mutateAsync(member.id)}>
                  Remove
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!membersQuery.data?.length ? <div className="card">No members found.</div> : null}
      </div>
    </section>
  )
}
