import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "../hooks/useAuth"
import { useOrganizationMutations } from "../hooks/useWorkspace"
import { createOrganizationFormSchema, type CreateOrganizationFormValues } from "../lib/form-schemas"

export function SettingsPage() {
  const { currentOrgId, currentRole, organizations, revokeAllSessionsMutation, revokeSessionMutation, sessionsQuery, user } = useAuth()
  const { createOrganizationMutation } = useOrganizationMutations()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationFormSchema),
    defaultValues: {
      name: "",
      slug: ""
    }
  })

  async function handleCreateOrganization(values: CreateOrganizationFormValues) {
    await createOrganizationMutation.mutateAsync(values)
    reset()
  }

  const currentOrganization = organizations.find((organization) => organization.id === currentOrgId)

  return (
    <section className="stack">
      <div>
        <h2>Settings</h2>
        <p className="muted">Organization settings, profile, sessions, and future billing controls.</p>
      </div>

      <div className="grid">
        <article className="card stack">
          <h3>Current workspace</h3>
          <p><strong>{currentOrganization?.name ?? "No workspace selected"}</strong></p>
          <p className="muted">Slug: {currentOrganization?.slug ?? "n/a"}</p>
          <p className="muted">Your role: {currentRole ?? "n/a"}</p>
          <p className="muted">Signed in as {user?.email ?? "unknown"}</p>
        </article>

        <form className="card stack" onSubmit={handleSubmit(handleCreateOrganization)}>
          <h3>Create workspace</h3>
          <label className="field">
            <span>Name</span>
            <input {...register("name")} />
            {errors.name ? <p className="error-text">{errors.name.message}</p> : null}
          </label>
          <label className="field">
            <span>Slug</span>
            <input {...register("slug")} />
            {errors.slug ? <p className="error-text">{errors.slug.message}</p> : null}
          </label>
          <button type="submit" disabled={createOrganizationMutation.isPending}>
            {createOrganizationMutation.isPending ? "Creating..." : "Create workspace"}
          </button>
        </form>
      </div>

      <div className="row">
        <button type="button" onClick={() => void revokeAllSessionsMutation.mutateAsync()}>
          Log out all devices
        </button>
      </div>

      <div className="stack">
        {sessionsQuery.data?.map((session) => (
          <article className="card stack" key={session.id}>
            <h3>{session.userAgent ?? "Unknown device"}</h3>
            <p className="muted">IP: {session.ip ?? "Unknown"} | Expires: {new Date(session.expiresAt).toLocaleString()}</p>
            <button type="button" onClick={() => void revokeSessionMutation.mutateAsync(session.id)}>
              Revoke session
            </button>
          </article>
        ))}
        {!sessionsQuery.data?.length ? (
          <div className="card">
            <p>No active sessions to show.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
