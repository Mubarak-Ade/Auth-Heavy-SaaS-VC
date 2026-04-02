import { FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { useInvite } from "../hooks/useInvite"

export function RegisterPage() {
  const { registerMutation } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const { inviteQuery } = useInvite(inviteToken)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (inviteQuery.data?.invite.email) {
      setEmail(inviteQuery.data.invite.email)
    }
  }, [inviteQuery.data])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    try {
      await registerMutation.mutateAsync({
        name,
        email,
        password,
        inviteToken: inviteToken ?? undefined
      })
      navigate("/")
    } catch {
      setError("Registration failed. Try a different email or stronger password.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={handleSubmit}>
        <div>
          <h1>Create your account</h1>
          <p className="muted">
            {inviteQuery.data
              ? `Join ${inviteQuery.data.organization.name} and get signed in immediately.`
              : "Start your workspace and get signed in immediately."}
          </p>
        </div>

        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

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

        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account..." : "Register"}
        </button>

        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
