import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { useInvite } from "../hooks/useInvite"
import { registerFormSchema, type RegisterFormValues } from "../lib/form-schemas"

export function RegisterPage() {
  const { registerMutation } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const { inviteQuery } = useInvite(inviteToken)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  })

  useEffect(() => {
    if (inviteQuery.data?.invite.email) {
      setValue("email", inviteQuery.data.invite.email, { shouldValidate: true })
    }
  }, [inviteQuery.data, setValue])

  async function onSubmit(values: RegisterFormValues) {
    setError(null)
    try {
      await registerMutation.mutateAsync({
        ...values,
        inviteToken: inviteToken ?? undefined
      })
      navigate("/")
    } catch {
      setError("Registration failed. Try a different email or stronger password.")
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={handleSubmit(onSubmit)}>
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
          <input {...register("name")} />
          {errors.name ? <p className="error-text">{errors.name.message}</p> : null}
        </label>

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
