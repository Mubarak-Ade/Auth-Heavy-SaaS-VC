import { FormEvent, useState } from "react"

import { useTaskMutations, useTasksQuery } from "../hooks/useWorkspace"
import { useUiStore } from "../store/ui-store"

export function TasksPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [editingPriority, setEditingPriority] = useState<"low" | "medium" | "high">("medium")
  const [editingStatus, setEditingStatus] = useState<"todo" | "in_progress" | "done">("todo")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in_progress" | "done">("all")
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "status">("newest")
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
    pushToast({ title: "Task created", tone: "success" })
  }

  function startEditing(task: {
    id: string
    title: string
    description: string
    priority: "low" | "medium" | "high"
    status: "todo" | "in_progress" | "done"
  }) {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
    setEditingDescription(task.description)
    setEditingPriority(task.priority)
    setEditingStatus(task.status)
  }

  async function handleUpdateTask(event: FormEvent) {
    event.preventDefault()
    if (!editingTaskId) return

    await updateTaskMutation.mutateAsync({
      taskId: editingTaskId,
      patch: {
        title: editingTitle,
        description: editingDescription,
        priority: editingPriority,
        status: editingStatus
      }
    })

    setEditingTaskId(null)
    pushToast({ title: "Task updated", tone: "success" })
  }

  const filteredTasks = [...(tasksQuery.data ?? [])]
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((left, right) => {
      if (sortBy === "priority") {
        const rank = { low: 0, medium: 1, high: 2 }
        return rank[right.priority] - rank[left.priority]
      }

      if (sortBy === "status") {
        const rank = { todo: 0, in_progress: 1, done: 2 }
        return rank[left.status] - rank[right.status]
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })

  return (
    <section className="stack">
      <div>
        <h2>Tasks</h2>
        <p className="muted">Track assignments, priorities, and progress.</p>
      </div>

      <div className="card filters-grid">
        <label className="field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" />
        </label>
        <label className="field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "todo" | "in_progress" | "done")
            }
          >
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "newest" | "priority" | "status")}>
            <option value="newest">Newest</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </label>
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

      {tasksQuery.isLoading ? <div className="card">Loading tasks...</div> : null}
      {tasksQuery.isError ? <div className="card error-text">Could not load tasks right now.</div> : null}

      <div className="stack">
        {filteredTasks.map((task) => (
          <article className="card stack" key={task.id}>
            {editingTaskId === task.id ? (
              <form className="stack" onSubmit={handleUpdateTask}>
                <label className="field">
                  <span>Title</span>
                  <input value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    value={editingDescription}
                    onChange={(event) => setEditingDescription(event.target.value)}
                    rows={4}
                  />
                </label>
                <div className="row">
                  <label className="field">
                    <span>Priority</span>
                    <select
                      value={editingPriority}
                      onChange={(event) =>
                        setEditingPriority(event.target.value as "low" | "medium" | "high")
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Status</span>
                    <select
                      value={editingStatus}
                      onChange={(event) =>
                        setEditingStatus(event.target.value as "todo" | "in_progress" | "done")
                      }
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                </div>
                <div className="row">
                  <button type="submit">Save changes</button>
                  <button type="button" onClick={() => setEditingTaskId(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h3>{task.title}</h3>
                  <p className="muted">{task.description || "No description"}</p>
                </div>
                <p>
                  Status: <strong>{task.status}</strong> | Priority: <strong>{task.priority}</strong>
                </p>
                <div className="row">
                  <button type="button" onClick={() => startEditing(task)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void updateTaskMutation
                        .mutateAsync({
                          taskId: task.id,
                          patch: { status: task.status === "done" ? "todo" : "done" }
                        })
                        .then(() => pushToast({ title: "Task status updated", tone: "success" }))
                    }
                  >
                    Toggle status
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void deleteTaskMutation
                        .mutateAsync(task.id)
                        .then(() => pushToast({ title: "Task deleted", tone: "info" }))
                    }
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
        {!filteredTasks.length && !tasksQuery.isLoading ? <div className="card">No tasks match your filters.</div> : null}
      </div>
    </section>
  )
}
