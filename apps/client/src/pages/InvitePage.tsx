import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { useInvite } from "../hooks/useInvite"

export function InvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()
  const { user } = useAuth()
  const { acceptInviteMutation, inviteQuery } = useInvite(token)

  async function handleAcceptInvite() {
    if (!user) {
      return
    }

    await acceptInviteMutation.mutateAsync()
    navigate("/")
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <p className="error-text">Invite token is missing.</p>
        </div>
      </div>
    )
  }

  if (inviteQuery.isLoading) {
    return <div className="centered">Loading invite...</div>
  }

  if (inviteQuery.isError || !inviteQuery.data) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <p className="error-text">This invite is invalid or expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="card auth-card stack">
        <div>
          <h1>Workspace invite</h1>
          <p className="muted">
            You were invited to join <strong>{inviteQuery.data.organization.name}</strong> as{" "}
            <strong>{inviteQuery.data.invite.role}</strong>.
          </p>
        </div>

        <div className="card surface-muted">
          <p className="muted">Invited email</p>
          <p>{inviteQuery.data.invite.email}</p>
          <p className="muted">
            Expires {new Date(inviteQuery.data.invite.expiresAt).toLocaleString()}
          </p>
        </div>

        {user ? (
          <button type="button" onClick={() => void handleAcceptInvite()} disabled={acceptInviteMutation.isPending}>
            {acceptInviteMutation.isPending ? "Accepting..." : "Accept invite"}
          </button>
        ) : (
          <div className="stack">
            <Link className="button-link" to={`/register?invite=${encodeURIComponent(token)}`}>
              Create account and join
            </Link>
            <Link className="button-link secondary-link" to={`/login?invite=${encodeURIComponent(token)}`}>
              Log in to accept
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
