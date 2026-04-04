import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { loginFormSchema, type LoginFormValues } from "../lib/form-schemas"

export function LoginPage() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "demo@example.com",
      password: "password123"
    }
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      await loginMutation.mutateAsync(values)
      navigate(inviteToken ? `/invite?token=${encodeURIComponent(inviteToken)}` : (location.state?.from?.pathname ?? "/"))
    } catch {
      setError("Login failed. Check your credentials and try again.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1>Welcome back</h1>
          <p className="muted">Log in to your workspace.</p>
        </div>

        <label className="field">
          <span>Email</span>
          <input {...register("email")} type="email" />
          {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
        </label>

        <label className="field">
          <span>Password</span>
          <input {...register("password")} type="password" />
          {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
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
