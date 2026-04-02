import { useAuth } from "../hooks/useAuth"

export function SettingsPage() {
  const { revokeAllSessionsMutation, revokeSessionMutation, sessionsQuery } = useAuth()

  return (
    <section className="stack">
      <div>
        <h2>Settings</h2>
        <p className="muted">Organization settings, profile, sessions, and future billing controls.</p>
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
