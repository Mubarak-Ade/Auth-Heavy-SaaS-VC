import { FormEvent, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

export function ResetPasswordPage() {
  const { resetPasswordMutation } = useAuth()
  const [searchParams] = useSearchParams()
  const presetToken = useMemo(() => searchParams.get("token") ?? "", [searchParams])
  const [token, setToken] = useState(presetToken)
  const [newPassword, setNewPassword] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword })
      setSuccess(true)
      setNewPassword("")
    } catch {
      setError("Reset failed. The token may be invalid or expired.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={handleSubmit}>
        <div>
          <h1>Reset password</h1>
          <p className="muted">Enter the reset token and choose a new password.</p>
        </div>

        <label className="field">
          <span>Reset token</span>
          <input value={token} onChange={(event) => setToken(event.target.value)} />
        </label>

        <label className="field">
          <span>New password</span>
          <input
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">Password updated. You can log in now.</p> : null}

        <button type="submit" disabled={resetPasswordMutation.isPending}>
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
        </button>

        <p className="muted">
          Back to <Link to="/login">login</Link>
        </p>
      </form>
    </div>
  )
}
