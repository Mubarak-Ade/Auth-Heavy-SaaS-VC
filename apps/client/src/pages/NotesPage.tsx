import { FormEvent, useState } from "react"

import { useNoteMutations, useNotesQuery } from "../hooks/useWorkspace"

export function NotesPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<"private" | "org" | "public">("org")
  const notesQuery = useNotesQuery()
  const { createNoteMutation, updateNoteMutation, deleteNoteMutation } = useNoteMutations()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    await createNoteMutation.mutateAsync({ title, content, visibility })
    setTitle("")
    setContent("")
    setVisibility("org")
  }

  return (
    <section className="stack">
      <div>
        <h2>Notes</h2>
        <p className="muted">Workspace pages for lightweight documentation and collaboration.</p>
      </div>

      <form className="card stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Content</span>
          <input value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        <label className="field">
          <span>Visibility</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as "private" | "org" | "public")}
          >
            <option value="private">Private</option>
            <option value="org">Org</option>
            <option value="public">Public</option>
          </select>
        </label>
        <button type="submit" disabled={createNoteMutation.isPending}>
          {createNoteMutation.isPending ? "Saving..." : "Create note"}
        </button>
      </form>

      <div className="stack">
        {notesQuery.data?.map((note) => (
          <article className="card stack" key={note.id}>
            <div>
              <h3>{note.title}</h3>
              <p>{note.content || "No content"}</p>
            </div>
            <p className="muted">Visibility: {note.visibility}</p>
            <div className="row">
              <button
                type="button"
                onClick={() =>
                  void updateNoteMutation.mutateAsync({
                    noteId: note.id,
                    patch: {
                      visibility: note.visibility === "org" ? "private" : "org"
                    }
                  })
                }
              >
                Toggle visibility
              </button>
              <button type="button" onClick={() => void deleteNoteMutation.mutateAsync(note.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!notesQuery.data?.length ? <div className="card">No notes yet.</div> : null}
      </div>
    </section>
  )
}
