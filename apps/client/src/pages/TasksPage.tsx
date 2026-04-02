export function TasksPage() {
  return (
    <section className="stack">
      <div>
        <h2>Tasks</h2>
        <p className="muted">Track assignments, priorities, and progress.</p>
      </div>

      <div className="card">
        <p>No tasks loaded yet. Connect this page to `GET /orgs/:orgId/tasks` next.</p>
      </div>
    </section>
  )
}
