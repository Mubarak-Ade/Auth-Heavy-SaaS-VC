import { FormEvent, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    try {
      await login(email, password)
      navigate(location.state?.from?.pathname ?? "/")
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

        <button type="submit">Login</button>
      </form>
    </div>
  )
}
