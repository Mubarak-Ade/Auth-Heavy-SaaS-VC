export function NotesPage() {
  return (
    <section className="stack">
      <div>
        <h2>Notes</h2>
        <p className="muted">Workspace pages for lightweight documentation and collaboration.</p>
      </div>

      <div className="card">
        <p>No notes loaded yet. Connect this page to `GET /orgs/:orgId/notes` next.</p>
      </div>
    </section>
  )
}
