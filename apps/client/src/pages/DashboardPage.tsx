import { useDashboardQuery } from "../hooks/useWorkspace"

export function DashboardPage() {
  const dashboardQuery = useDashboardQuery()
  const metrics = dashboardQuery.data

  return (
    <section className="stack">
      <div className="hero card">
        <h2>Dashboard</h2>
        <p className="muted">Overview of tasks, notes, and workspace activity.</p>
        <p>
          Keep the team moving by tracking open work, completed work, and the knowledge base in one
          place.
        </p>
      </div>

      {dashboardQuery.isLoading ? <div className="card">Loading dashboard...</div> : null}
      {dashboardQuery.isError ? <div className="card error-text">Could not load dashboard metrics.</div> : null}

      <div className="grid">
        <article className="card metric-card">
          <h3>Open tasks</h3>
          <p>{metrics?.openTasks ?? 0}</p>
        </article>
        <article className="card metric-card">
          <h3>Completed this week</h3>
          <p>{metrics?.completedTasks ?? 0}</p>
        </article>
        <article className="card metric-card">
          <h3>Notes</h3>
          <p>{metrics?.totalNotes ?? 0}</p>
        </article>
        <article className="card metric-card">
          <h3>Total tasks</h3>
          <p>{metrics?.totalTasks ?? 0}</p>
        </article>
      </div>
    </section>
  )
}
