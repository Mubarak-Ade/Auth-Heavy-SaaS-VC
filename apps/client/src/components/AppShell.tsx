import type { PropsWithChildren } from "react"
import { Link, useLocation } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

const NAV_ITEMS = [
  { to: "/", icon: "dashboard", label: "Dashboard", filled: true },
  { to: "/tasks", icon: "assignment", label: "Tasks" },
  { to: "/notes", icon: "description", label: "Notes" },
  { to: "/members", icon: "group", label: "Members" },
  { to: "/settings", icon: "settings", label: "Settings" },
]

export function AppShell({ children }: PropsWithChildren) {
  const { currentOrgId, currentRole, organizations, setCurrentOrgId, user, logoutMutation } =
    useAuth()
  const location = useLocation()

  const currentOrg = organizations.find((o) => o.id === currentOrgId)
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      {/* ── Side Navigation Shell ── */}
      <aside className="fixed h-full w-[240px] left-0 top-0 bg-primary-container dark:bg-primary flex flex-col py-8 px-4 justify-between z-50">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1 px-2">
            <h1 className="font-headline-md text-[20px] font-bold text-on-primary-container dark:text-primary-fixed leading-tight">
              Nexus Workspace
            </h1>
            <p className="font-label-sm text-[12px] text-on-primary-container/60 uppercase tracking-widest">
              {currentRole ? `${currentRole} Plan` : "Pro Plan"}
            </p>
          </div>

          {/* Org Switcher */}
          {organizations.length > 1 && (
            <div className="px-2">
              <select
                value={currentOrgId ?? ""}
                onChange={(e) => setCurrentOrgId(e.target.value)}
                className="w-full bg-primary-fixed/10 border border-on-primary-container/20 text-on-primary-fixed text-[12px] font-label-sm rounded-lg px-3 py-2 outline-none focus:border-primary-fixed transition-colors cursor-pointer"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} className="bg-primary-container text-on-primary-fixed">
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 active:scale-95 no-underline ${
                    isActive
                      ? "text-on-primary-fixed bg-primary-fixed dark:bg-primary-fixed-dim dark:text-on-primary-fixed"
                      : "text-on-primary-container/70 dark:text-primary-fixed-dim/70 hover:bg-primary-fixed/20 dark:hover:bg-primary-fixed-dim/10"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isActive && item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-sm text-[12px] tracking-wider">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3 text-on-primary-container/70 dark:text-primary-fixed-dim/70 hover:bg-primary-fixed/20 dark:hover:bg-primary-fixed-dim/10 transition-colors cursor-pointer rounded-lg active:scale-95 transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span className="font-label-sm text-[12px] tracking-wider">Help</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-3 text-on-primary-container/70 dark:text-primary-fixed-dim/70 hover:bg-primary-fixed/20 dark:hover:bg-primary-fixed-dim/10 transition-colors cursor-pointer rounded-lg w-full border-0 bg-transparent text-left active:scale-95 transition-all duration-200"
            onClick={() => void logoutMutation.mutateAsync()}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-label-sm text-[12px] tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Global search..."
              className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-[15px] focus:outline-none focus:border-primary-container w-[320px] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-0 cursor-pointer">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
          </div>
          <button className="bg-primary text-on-primary px-6 py-2.5 rounded font-button text-[14px] font-semibold hover:opacity-90 transition-all active:scale-95 border-0 cursor-pointer">
            Create New
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high flex items-center justify-center text-primary font-bold text-[12px]">
            {userInitial}
          </div>
        </div>
      </header>

      {/* ── Main Content Stage ── */}
      <main className="ml-[240px] pt-16 min-h-screen">
        <div className="max-w-[1280px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
