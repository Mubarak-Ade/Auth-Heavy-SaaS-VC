import type { PropsWithChildren } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

export function AppShell({ children }: PropsWithChildren) {
  const { currentOrgId, organizations, setCurrentOrgId, user, logoutMutation } = useAuth()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <h1>Auth Heavy SaaS</h1>
          <p className="muted">Mini Notion and task manager</p>
        </div>

        <label className="field">
          <span>Workspace</span>
          <select
            value={currentOrgId ?? ""}
            onChange={(event) => setCurrentOrgId(event.target.value)}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>

        <nav className="nav">
          <Link to="/">Dashboard</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/members">Members</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        <div className="sidebar-footer">
          <p className="muted">{user?.email}</p>
          <button type="button" onClick={() => void logoutMutation.mutateAsync()}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}
