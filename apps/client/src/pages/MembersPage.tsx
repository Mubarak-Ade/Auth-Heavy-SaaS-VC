import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "../hooks/useAuth"
import { useMemberMutations, useMembersQuery } from "../hooks/useWorkspace"
import { inviteMemberFormSchema, type InviteMemberFormValues } from "../lib/form-schemas"
import { useUiStore } from "../store/ui-store"

export function MembersPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [lastInviteToken, setLastInviteToken] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "member" | "viewer">("all")
  const [sortBy, setSortBy] = useState<"name" | "role">("name")
  const { currentRole } = useAuth()
  const membersQuery = useMembersQuery()
  const { inviteMemberMutation, updateMemberRoleMutation, removeMemberMutation } = useMemberMutations()
  
  const canManageMembers = currentRole === "owner" || currentRole === "admin"
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      email: "",
      role: "member"
    }
  })

  async function handleInvite(values: InviteMemberFormValues) {
    const result = await inviteMemberMutation.mutateAsync(values)
    setLastInviteToken(result.inviteToken)
    reset()
    pushToast({ title: "Invite created", tone: "success" })
  }

  const filteredMembers = [...(membersQuery.data ?? [])]
    .filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === "all" ? true : member.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((left, right) => {
      if (sortBy === "role") {
        const rank = { owner: 3, admin: 2, member: 1, viewer: 0 }
        return rank[right.role] - rank[left.role]
      }
      return left.name.localeCompare(right.name)
    })

  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <h1 className="font-headline-lg text-[32px] font-semibold text-primary">Members</h1>
        <p className="font-body-md text-[15px] text-outline mt-2">
          Invite teammates, review access, and manage workspace roles.
        </p>
      </section>

      {/* Filters */}
      <section className="bg-white ghost-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-6 space-y-2">
          <label className="font-label-sm text-[12px] text-on-secondary-container tracking-wider block">Search</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">search</span>
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary-container outline-none font-body-md text-[14px] transition-all"
            />
          </div>
        </div>
        <div className="md:col-span-3 space-y-2">
          <label className="font-label-sm text-[12px] text-on-secondary-container tracking-wider block">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary-container outline-none font-body-md text-[14px] transition-all"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div className="md:col-span-3 space-y-2">
          <label className="font-label-sm text-[12px] text-on-secondary-container tracking-wider block">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary-container outline-none font-body-md text-[14px] transition-all"
          >
            <option value="name">Alphabetical</option>
            <option value="role">Highest Role</option>
          </select>
        </div>
      </section>

      {/* Invite Form */}
      {canManageMembers && (
        <section className="bg-primary-fixed/30 rounded-xl p-8 space-y-6">
          <h3 className="font-headline-md text-[20px] font-semibold text-primary">Invite Teammate</h3>
          <form className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start" onSubmit={handleSubmit(handleInvite)}>
            <div className="md:col-span-6 space-y-1">
              <input 
                {...register("email")} 
                type="email" 
                placeholder="colleague@example.com"
                className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant rounded-lg focus:border-primary-container outline-none font-body-md text-[15px]"
              />
              {errors.email && <p className="text-error text-[12px]">{errors.email.message}</p>}
            </div>
            <div className="md:col-span-3">
              <select 
                {...register("role")}
                className="w-full px-4 py-2.5 bg-white/80 border border-outline-variant rounded-lg focus:border-primary-container outline-none font-body-md text-[15px]"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={inviteMemberMutation.isPending}
              className="md:col-span-3 bg-primary-container text-white px-4 py-2.5 rounded-lg font-button text-[14px] tracking-wide hover:opacity-90 transition-all border-0 cursor-pointer disabled:opacity-50"
            >
              {inviteMemberMutation.isPending ? "Sending..." : "Send Invite"}
            </button>
          </form>
          {lastInviteToken && (
            <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between">
              <p className="font-label-sm text-[12px] text-outline">
                Testing Invite Token: <code className="bg-white px-2 py-1 rounded">{lastInviteToken}</code>
              </p>
              <button onClick={() => { navigator.clipboard.writeText(lastInviteToken); pushToast({ title: "Copied to clipboard", tone: "info" }) }} className="text-primary text-[12px] hover:underline">Copy</button>
            </div>
          )}
        </section>
      )}

      {/* Members List */}
      <section className="bg-white ghost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-secondary-container uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-secondary-container uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-secondary-container uppercase tracking-widest">Joined</th>
                {canManageMembers && <th className="px-6 py-4 font-label-sm text-[11px] text-on-secondary-container uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {membersQuery.isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-surface-container-high rounded w-1/3" /></td>
                  </tr>
                ))
              ) : membersQuery.isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-error">Could not load members.</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-[12px]">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-body-md text-[15px] font-semibold text-primary">{member.name}</div>
                          <div className="font-body-md text-[13px] text-outline">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-sm font-label-sm text-[10px] uppercase tracking-widest ${
                        member.role === 'owner' ? 'bg-primary-container text-white' : 
                        member.role === 'admin' ? 'bg-primary-fixed text-primary' : 
                        'bg-surface-container-highest text-outline'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body-md text-[14px] text-outline">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    {canManageMembers && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select 
                            value={member.role}
                            onChange={(e) => void updateMemberRoleMutation.mutateAsync({ memberId: member.id, role: e.target.value as any })}
                            className="bg-transparent border border-outline-variant rounded px-2 py-1 text-[12px] outline-none"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button 
                            onClick={() => void removeMemberMutation.mutateAsync(member.id)}
                            className="p-1.5 hover:bg-error-container hover:text-error rounded transition-colors text-outline"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!filteredMembers.length && !membersQuery.isLoading && (
            <div className="py-20 text-center text-outline font-body-md">No members found.</div>
          )}
        </div>
      </section>
    </div>
  )
}
