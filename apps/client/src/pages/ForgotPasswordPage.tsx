import { FormEvent, useState } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

export function ForgotPasswordPage() {
  const { forgotPasswordMutation } = useAuth()
  const [email, setEmail] = useState("")
  const [submittedToken, setSubmittedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      const result = await forgotPasswordMutation.mutateAsync({ email })
      setSubmittedToken(result.resetToken ?? null)
    } catch {
      setError("Could not request a reset right now.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={handleSubmit}>
        <div>
          <h1>Forgot password</h1>
          <p className="muted">Request a reset token for your account.</p>
        </div>

        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        {submittedToken ? (
          <div className="card surface-muted">
            <p className="muted">Reset token for local testing:</p>
            <code>{submittedToken}</code>
          </div>
        ) : null}

        <button type="submit" disabled={forgotPasswordMutation.isPending}>
          {forgotPasswordMutation.isPending ? "Requesting..." : "Send reset request"}
        </button>

        <p className="muted">
          Back to <Link to="/login">login</Link>
        </p>
      </form>
    </div>
  )
}
