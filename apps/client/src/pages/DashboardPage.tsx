export function DashboardPage() {
  return (
    <section className="stack">
      <div>
        <h2>Dashboard</h2>
        <p className="muted">Overview of tasks, notes, and workspace activity.</p>
      </div>

      <div className="grid">
        <article className="card">
          <h3>Open tasks</h3>
          <p>5</p>
        </article>
        <article className="card">
          <h3>Completed this week</h3>
          <p>7</p>
        </article>
        <article className="card">
          <h3>Notes</h3>
          <p>4</p>
        </article>
      </div>
    </section>
  )
}
