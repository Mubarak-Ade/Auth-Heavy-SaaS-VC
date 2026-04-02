import { FormEvent, useState } from "react"

import { useTaskMutations, useTasksQuery } from "../hooks/useWorkspace"

export function TasksPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const tasksQuery = useTasksQuery()
  const { createTaskMutation, updateTaskMutation, deleteTaskMutation } = useTaskMutations()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    await createTaskMutation.mutateAsync({
      title,
      description,
      priority
    })

    setTitle("")
    setDescription("")
    setPriority("medium")
  }

  return (
    <section className="stack">
      <div>
        <h2>Tasks</h2>
        <p className="muted">Track assignments, priorities, and progress.</p>
      </div>

      <form className="card stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Task title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Description</span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="field">
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit" disabled={createTaskMutation.isPending}>
          {createTaskMutation.isPending ? "Saving..." : "Create task"}
        </button>
      </form>

      <div className="stack">
        {tasksQuery.data?.map((task) => (
          <article className="card stack" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p className="muted">{task.description || "No description"}</p>
            </div>
            <p>
              Status: <strong>{task.status}</strong> | Priority: <strong>{task.priority}</strong>
            </p>
            <div className="row">
              <button
                type="button"
                onClick={() =>
                  void updateTaskMutation.mutateAsync({
                    taskId: task.id,
                    patch: { status: task.status === "done" ? "todo" : "done" }
                  })
                }
              >
                Toggle status
              </button>
              <button type="button" onClick={() => void deleteTaskMutation.mutateAsync(task.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {!tasksQuery.data?.length ? <div className="card">No tasks yet.</div> : null}
      </div>
    </section>
  )
}
