import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "../lib/form-schemas"

export function ForgotPasswordPage() {
  const { forgotPasswordMutation } = useAuth()
  const [submittedToken, setSubmittedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: ""
    }
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null)

    try {
      const result = await forgotPasswordMutation.mutateAsync(values)
      setSubmittedToken(result.resetToken ?? null)
    } catch {
      setError("Could not request a reset right now.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1>Forgot password</h1>
          <p className="muted">Request a reset token for your account.</p>
        </div>

        <label className="field">
          <span>Email</span>
          <input {...register("email")} type="email" />
          {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
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
