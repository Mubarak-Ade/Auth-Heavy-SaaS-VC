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
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section>
        <h1 className="font-headline-lg text-[32px] font-semibold text-primary">Settings</h1>
        <p className="font-body-md text-[15px] text-outline mt-2">
          Organization configurations, profile management, and session security.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Workspace Info Card */}
        <section className="bg-white ghost-border rounded-xl p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary text-[24px] font-bold">
              {currentOrganization?.name.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <h3 className="font-headline-md text-[20px] font-semibold text-primary">Current Workspace</h3>
              <p className="font-body-md text-[14px] text-outline">{currentOrganization?.name ?? "No workspace selected"}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <div className="flex justify-between">
              <span className="font-label-sm text-[12px] text-outline uppercase tracking-widest">Workspace Slug</span>
              <span className="font-body-md text-[14px] font-semibold text-primary">{currentOrganization?.slug ?? "n/a"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-label-sm text-[12px] text-outline uppercase tracking-widest">Your Role</span>
              <span className="px-2 py-0.5 rounded-sm bg-primary-fixed text-primary font-label-sm text-[10px] uppercase tracking-widest">
                {currentRole ?? "n/a"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-label-sm text-[12px] text-outline uppercase tracking-widest">Account</span>
              <span className="font-body-md text-[14px] text-primary">{user?.email ?? "unknown"}</span>
            </div>
          </div>
        </section>

        {/* Create Workspace Form */}
        <section className="bg-primary-container text-white rounded-xl p-8 space-y-6">
          <h3 className="font-headline-md text-[20px] font-semibold text-on-primary-fixed">Create New Workspace</h3>
          <form className="space-y-4" onSubmit={handleSubmit(handleCreateOrganization)}>
            <div className="space-y-1">
              <label className="font-label-sm text-[11px] text-on-primary-container/60 uppercase tracking-widest">Workspace Name</label>
              <input 
                {...register("name")} 
                className="w-full px-4 py-2.5 bg-white/10 border border-on-primary-container/20 rounded-lg focus:border-on-primary-fixed outline-none text-[15px] text-white transition-all"
                placeholder="Acme Corp"
              />
              {errors.name && <p className="text-error-container text-[12px]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-[11px] text-on-primary-container/60 uppercase tracking-widest">URL Slug</label>
              <input 
                {...register("slug")} 
                className="w-full px-4 py-2.5 bg-white/10 border border-on-primary-container/20 rounded-lg focus:border-on-primary-fixed outline-none text-[15px] text-white transition-all"
                placeholder="acme-corp"
              />
              {errors.slug && <p className="text-error-container text-[12px]">{errors.slug.message}</p>}
            </div>
            <button 
              type="submit" 
              disabled={createOrganizationMutation.isPending}
              className="w-full bg-primary-fixed text-primary px-4 py-3 rounded-lg font-button text-[14px] font-bold tracking-wide hover:opacity-90 transition-all border-0 cursor-pointer disabled:opacity-50 mt-2"
            >
              {createOrganizationMutation.isPending ? "Creating..." : "Launch Workspace"}
            </button>
          </form>
        </section>
      </div>

      {/* Sessions Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-headline-md text-[22px] font-semibold text-primary">Active Sessions</h3>
            <p className="font-body-md text-[14px] text-outline mt-1">Review and manage the devices currently logged into your account.</p>
          </div>
          <button 
            type="button" 
            onClick={() => void revokeAllSessionsMutation.mutateAsync()}
            className="text-error font-button text-[13px] hover:underline cursor-pointer bg-transparent border-0"
          >
            Logout all devices
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sessionsQuery.data?.map((session) => (
            <article 
              key={session.id} 
              className="bg-white ghost-border rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary-container/20 transition-all"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[24px]">
                    {session.userAgent?.toLowerCase().includes('mobile') ? 'smartphone' : 'laptop_mac'}
                  </span>
                </div>
                <div>
                  <h4 className="font-body-md text-[15px] font-semibold text-primary truncate max-w-[300px]">
                    {session.userAgent ?? "Unknown device"}
                  </h4>
                  <div className="flex gap-4 font-label-sm text-[11px] text-outline mt-0.5">
                    <span>IP: {session.ip ?? "Unknown"}</span>
                    <span>Expires: {new Date(session.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => void revokeSessionMutation.mutateAsync(session.id)}
                className="px-4 py-2 text-outline hover:text-error hover:bg-error-container rounded-lg font-button text-[13px] transition-all border-0 bg-transparent cursor-pointer whitespace-nowrap"
              >
                Revoke
              </button>
            </article>
          ))}
          {!sessionsQuery.data?.length && (
            <div className="bg-white ghost-border rounded-xl p-12 text-center text-outline">
              No active sessions found.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
