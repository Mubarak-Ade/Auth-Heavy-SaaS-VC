import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { resetPasswordFormSchema, type ResetPasswordFormValues } from "../lib/form-schemas"

export function ResetPasswordPage() {
  const { resetPasswordMutation } = useAuth()
  const [searchParams] = useSearchParams()
  const presetToken = useMemo(() => searchParams.get("token") ?? "", [searchParams])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: presetToken,
      newPassword: ""
    }
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null)

    try {
      await resetPasswordMutation.mutateAsync(values)
      setSuccess(true)
      reset({ token: values.token, newPassword: "" })
    } catch {
      setError("Reset failed. The token may be invalid or expired.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1>Reset password</h1>
          <p className="muted">Enter the reset token and choose a new password.</p>
        </div>

        <label className="field">
          <span>Reset token</span>
          <input {...register("token")} />
          {errors.token ? <p className="error-text">{errors.token.message}</p> : null}
        </label>

        <label className="field">
          <span>New password</span>
          <input {...register("newPassword")} type="password" />
          {errors.newPassword ? <p className="error-text">{errors.newPassword.message}</p> : null}
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
