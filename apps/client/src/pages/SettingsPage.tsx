import { FormEvent, useState } from "react"

import { useAuth } from "../hooks/useAuth"
import { useOrganizationMutations } from "../hooks/useWorkspace"

export function SettingsPage() {
  const { currentOrgId, currentRole, organizations, revokeAllSessionsMutation, revokeSessionMutation, sessionsQuery, user } = useAuth()
  const { createOrganizationMutation } = useOrganizationMutations()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  async function handleCreateOrganization(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !slug.trim()) return

    await createOrganizationMutation.mutateAsync({ name, slug })
    setName("")
    setSlug("")
  }

  const currentOrganization = organizations.find((organization) => organization.id === currentOrgId)

  return (
    <section className="stack">
      <div>
        <h2>Settings</h2>
        <p className="muted">Organization settings, profile, sessions, and future billing controls.</p>
      </div>

      <div className="grid">
        <article className="card stack">
          <h3>Current workspace</h3>
          <p><strong>{currentOrganization?.name ?? "No workspace selected"}</strong></p>
          <p className="muted">Slug: {currentOrganization?.slug ?? "n/a"}</p>
          <p className="muted">Your role: {currentRole ?? "n/a"}</p>
          <p className="muted">Signed in as {user?.email ?? "unknown"}</p>
        </article>

        <form className="card stack" onSubmit={handleCreateOrganization}>
          <h3>Create workspace</h3>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} />
          </label>
          <button type="submit" disabled={createOrganizationMutation.isPending}>
            {createOrganizationMutation.isPending ? "Creating..." : "Create workspace"}
          </button>
        </form>
      </div>

      <div className="row">
        <button type="button" onClick={() => void revokeAllSessionsMutation.mutateAsync()}>
          Log out all devices
        </button>
      </div>

      <div className="stack">
        {sessionsQuery.data?.map((session) => (
          <article className="card stack" key={session.id}>
            <h3>{session.userAgent ?? "Unknown device"}</h3>
            <p className="muted">IP: {session.ip ?? "Unknown"} | Expires: {new Date(session.expiresAt).toLocaleString()}</p>
            <button type="button" onClick={() => void revokeSessionMutation.mutateAsync(session.id)}>
              Revoke session
            </button>
          </article>
        ))}
        {!sessionsQuery.data?.length ? (
          <div className="card">
            <p>No active sessions to show.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
