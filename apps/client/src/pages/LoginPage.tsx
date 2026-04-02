import { FormEvent, useState } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

export function LoginPage() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    try {
      await loginMutation.mutateAsync({ email, password })
      navigate(inviteToken ? `/invite?token=${encodeURIComponent(inviteToken)}` : (location.state?.from?.pathname ?? "/"))
    } catch {
      setError("Login failed. Check your credentials and try again.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div>
          <h1>Welcome back</h1>
          <p className="muted">Log in to your workspace.</p>
        </div>

        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        <div className="auth-links">
          <Link to={inviteToken ? `/register?invite=${encodeURIComponent(inviteToken)}` : "/register"}>
            Create account
          </Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  )
}
