import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useTaskMutations, useTasksQuery } from "../hooks/useWorkspace"
import { taskFormSchema, type TaskFormValues } from "../lib/form-schemas"
import { useUiStore } from "../store/ui-store"

export function TasksPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "in_progress" | "done">("all")
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "status">("newest")
  const tasksQuery = useTasksQuery()
  const { createTaskMutation, updateTaskMutation, deleteTaskMutation } = useTaskMutations()
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium"
    }
  })
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo"
    }
  })

  async function handleCreateTask(values: TaskFormValues) {
    await createTaskMutation.mutateAsync({
      title: values.title,
      description: values.description,
      priority: values.priority
    })

    resetCreateForm()
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
    resetEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status
    })
  }

  async function handleUpdateTask(values: TaskFormValues) {
    if (!editingTaskId) return

    await updateTaskMutation.mutateAsync({
      taskId: editingTaskId,
      patch: {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status
      }
    })

    setEditingTaskId(null)
    resetEditForm()
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

      <form className="card stack" onSubmit={handleCreateSubmit(handleCreateTask)}>
        <label className="field">
          <span>Task title</span>
          <input {...registerCreate("title")} />
          {createErrors.title ? <p className="error-text">{createErrors.title.message}</p> : null}
        </label>
        <label className="field">
          <span>Description</span>
          <input {...registerCreate("description")} />
          {createErrors.description ? <p className="error-text">{createErrors.description.message}</p> : null}
        </label>
        <label className="field">
          <span>Priority</span>
          <select {...registerCreate("priority")}>
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
              <form className="stack" onSubmit={handleEditSubmit(handleUpdateTask)}>
                <label className="field">
                  <span>Title</span>
                  <input {...registerEdit("title")} />
                  {editErrors.title ? <p className="error-text">{editErrors.title.message}</p> : null}
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea {...registerEdit("description")} rows={4} />
                  {editErrors.description ? <p className="error-text">{editErrors.description.message}</p> : null}
                </label>
                <div className="row">
                  <label className="field">
                    <span>Priority</span>
                    <select {...registerEdit("priority")}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Status</span>
                    <select {...registerEdit("status")}>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                </div>
                <div className="row">
                  <button type="submit">Save changes</button>
                  <button type="button" onClick={() => { setEditingTaskId(null); resetEditForm() }}>
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
