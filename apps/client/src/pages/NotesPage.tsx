import { FormEvent, useState } from "react"

import { useNoteMutations, useNotesQuery } from "../hooks/useWorkspace"
import { useUiStore } from "../store/ui-store"

export function NotesPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingContent, setEditingContent] = useState("")
  const [editingVisibility, setEditingVisibility] = useState<"private" | "org" | "public">("org")
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "private" | "org" | "public">("all")
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated")
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
    pushToast({ title: "Note created", tone: "success" })
  }

  function startEditing(note: {
    id: string
    title: string
    content: string
    visibility: "private" | "org" | "public"
  }) {
    setEditingNoteId(note.id)
    setEditingTitle(note.title)
    setEditingContent(note.content)
    setEditingVisibility(note.visibility)
  }

  async function handleUpdateNote(event: FormEvent) {
    event.preventDefault()
    if (!editingNoteId) return

    await updateNoteMutation.mutateAsync({
      noteId: editingNoteId,
      patch: {
        title: editingTitle,
        content: editingContent,
        visibility: editingVisibility
      }
    })

    setEditingNoteId(null)
    pushToast({ title: "Note updated", tone: "success" })
  }

  const filteredNotes = [...(notesQuery.data ?? [])]
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
      const matchesVisibility = visibilityFilter === "all" ? true : note.visibility === visibilityFilter
      return matchesSearch && matchesVisibility
    })
    .sort((left, right) => {
      if (sortBy === "title") {
        return left.title.localeCompare(right.title)
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    })

  return (
    <section className="stack">
      <div>
        <h2>Notes</h2>
        <p className="muted">Workspace pages for lightweight documentation and collaboration.</p>
      </div>

      <div className="card filters-grid">
        <label className="field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" />
        </label>
        <label className="field">
          <span>Visibility</span>
          <select
            value={visibilityFilter}
            onChange={(event) =>
              setVisibilityFilter(event.target.value as "all" | "private" | "org" | "public")
            }
          >
            <option value="all">All</option>
            <option value="private">Private</option>
            <option value="org">Org</option>
            <option value="public">Public</option>
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "updated" | "title")}>
            <option value="updated">Recently updated</option>
            <option value="title">Title</option>
          </select>
        </label>
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

      {notesQuery.isLoading ? <div className="card">Loading notes...</div> : null}
      {notesQuery.isError ? <div className="card error-text">Could not load notes right now.</div> : null}

      <div className="stack">
        {filteredNotes.map((note) => (
          <article className="card stack" key={note.id}>
            {editingNoteId === note.id ? (
              <form className="stack" onSubmit={handleUpdateNote}>
                <label className="field">
                  <span>Title</span>
                  <input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} />
                </label>
                <label className="field">
                  <span>Content</span>
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    rows={6}
                  />
                </label>
                <label className="field">
                  <span>Visibility</span>
                  <select
                    value={editingVisibility}
                    onChange={(event) =>
                      setEditingVisibility(event.target.value as "private" | "org" | "public")
                    }
                  >
                    <option value="private">Private</option>
                    <option value="org">Org</option>
                    <option value="public">Public</option>
                  </select>
                </label>
                <div className="row">
                  <button type="submit">Save changes</button>
                  <button type="button" onClick={() => setEditingNoteId(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.content || "No content"}</p>
                </div>
                <p className="muted">Visibility: {note.visibility}</p>
                <div className="row">
                  <button type="button" onClick={() => startEditing(note)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void updateNoteMutation
                        .mutateAsync({
                          noteId: note.id,
                          patch: {
                            visibility: note.visibility === "org" ? "private" : "org"
                          }
                        })
                        .then(() => pushToast({ title: "Note visibility updated", tone: "success" }))
                    }
                  >
                    Toggle visibility
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void deleteNoteMutation
                        .mutateAsync(note.id)
                        .then(() => pushToast({ title: "Note deleted", tone: "info" }))
                    }
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
        {!filteredNotes.length && !notesQuery.isLoading ? <div className="card">No notes match your filters.</div> : null}
      </div>
    </section>
  )
}
