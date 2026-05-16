import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { FilterX, TrendingUp } from "lucide-react"

import { useTaskMutations, useTasksQuery, useDashboardQuery } from "../hooks/useWorkspace"
import { taskFormSchema, type TaskFormValues } from "../lib/form-schemas"
import { useUiStore } from "../store/ui-store"

const TaskStatus = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed"
} as const

const Priority = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
} as const

const priorityValues = ["low", "medium", "high"] as const
const statusFilterValues = ["all", "todo", "in_progress", "done"] as const
const sortValues = ["newest", "priority", "deadline"] as const

type StatusFilter = (typeof statusFilterValues)[number]
type SortBy = (typeof sortValues)[number]

const statusFilterLabels: Record<StatusFilter, string> = {
  all: "All Tasks",
  todo: TaskStatus.TODO,
  in_progress: TaskStatus.IN_PROGRESS,
  done: TaskStatus.COMPLETED
}

const sortLabels: Record<SortBy, string> = {
  newest: "Newest first",
  priority: "Priority High-Low",
  deadline: "Deadline soonest"
}

export function TasksPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("newest")

  const tasksQuery = useTasksQuery()
  const dashboardQuery = useDashboardQuery()
  const { createTaskMutation } = useTaskMutations()

  const metrics = dashboardQuery.data
  const completionRate = metrics
    ? Math.round((metrics.completedTasks / (metrics.totalTasks || 1)) * 100)
    : 0

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    watch: watchCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium"
    }
  })

  const selectedPriority = watchCreate("priority")

  async function handleCreateTask(values: TaskFormValues) {
    await createTaskMutation.mutateAsync({
      title: values.title,
      description: values.description,
      priority: values.priority
    })

    resetCreateForm()
    pushToast({ title: "Task created", tone: "success" })
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
      if (sortBy === "deadline") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="max-w-7xl mx-auto"
    >
      {/* Global Operations Hero */}
      <section className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-[240px] w-full rounded-xl overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-container/90 via-primary-container/40 to-transparent z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <img
            className="w-full h-full object-cover grayscale opacity-80 transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEjDzv6zODkaxtWxSphzZIwhA-7QP1jfeGDJPMGNsxr82OO7Nh1sEgb-a1_8WOkoQ8nXSXe-bPO0wLHKoPccYfTlgO7bVyvtsYnGrUU22pNEIP_YBNUD-jYQcI38BTopet-6skoLxORI0r5Ppf8ROWihIoO_Yc2phYgzbaEJ7SkQ_M4QyHmz_2JZIUaaKJIm9zpNDSm5ZTJdwlLmL4wZ-zhDwJ7muOzCIBJ3-op00BzJvcTw8WHrKdvnJr-oJckJh29WvllRgYxPs_"
            alt="Office hero"
          />
          <motion.div
            className="absolute inset-0 z-20 p-10 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Global Operations
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-on-primary-container max-w-lg"
            >
              Orchestrating complex workflows across distributed teams with real-time intelligence
              and seamless synchronization.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Header Section */}
      <header className="mb-8 flex flex-col gap-2">
        <h3 className="text-7xl font-bold text-primary">Tasks</h3>
        <p className="text-on-surface-variant max-w-2xl">
          Track assignments, priorities, and progress across your entire workspace from a single
          consolidated view.
        </p>
      </header>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 items-end bg-white p-8 rounded-xl border border-outline-variant">
        <motion.div
          className="md:col-span-6 flex flex-col gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Search
          </label>
          <div className="relative">
            <input
              className="w-full pl-4 pr-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded font-sans text-sm"
              placeholder="Search tasks..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>
        <motion.div
          className="md:col-span-3 flex flex-col gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Status
          </label>
          <select
            className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded bg-white appearance-none text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            {statusFilterValues.map((value) => (
              <option key={value} value={value}>
                {statusFilterLabels[value]}
              </option>
            ))}
          </select>
        </motion.div>
        <motion.div
          className="md:col-span-3 flex flex-col gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Sort
          </label>
          <select
            className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded bg-white appearance-none text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            {sortValues.map((value) => (
              <option key={value} value={value}>
                {sortLabels[value]}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Create Task Column */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white p-8 rounded-xl border border-outline-variant shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-8 border-l-4 border-primary-container pl-4">
              <h4 className="text-xl font-bold text-primary">Create task</h4>
              <p className="text-on-surface-variant text-xs mt-1 font-mono uppercase tracking-tight">
                Define the objective and assign priority.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleCreateSubmit(handleCreateTask)}>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Task title
                </label>
                <input
                  {...registerCreate("title")}
                  className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded text-sm"
                  placeholder="What needs to be done?"
                  type="text"
                />
                {createErrors.title && (
                  <p className="text-error text-xs">{createErrors.title.message}</p>
                )}
              </div>
              <motion.div className="flex flex-col gap-2" layout>
                <label className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Description
                </label>
                <textarea
                  {...registerCreate("description")}
                  className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded resize-none text-sm"
                  placeholder="Add additional context or requirements..."
                  rows={4}
                />
                {createErrors.description && (
                  <p className="text-error text-xs">{createErrors.description.message}</p>
                )}
              </motion.div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityValues.map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setValueCreate("priority", p)}
                      whileTap={{ scale: 0.98 }}
                      className={`py-2 border border-outline-variant rounded transition-all text-[10px] uppercase font-mono tracking-wider ${
                        selectedPriority === p
                          ? "bg-primary-container text-on-primary ring-2 ring-primary-container ring-offset-2"
                          : "hover:bg-surface-container-high"
                      }`}
                    >
                      {p === "low" ? Priority.LOW : p === "medium" ? Priority.MEDIUM : Priority.HIGH}
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={createTaskMutation.isPending}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-container text-white py-4 rounded font-display text-sm font-semibold hover:opacity-95 transition-all shadow-sm disabled:opacity-50"
              >
                {createTaskMutation.isPending ? "Creating..." : "Create task"}
              </motion.button>
            </form>
          </motion.div>

          {/* Workspace Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="bg-surface-container-low p-8 rounded-xl border border-outline-variant"
          >
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <TrendingUp size={18} className="text-primary-container" />
              <span className="font-mono text-[10px] text-primary-container uppercase tracking-widest font-bold">
                Workspace Insight
              </span>
            </motion.div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-on-surface-variant text-sm">Completion Rate</span>
                <span className="text-2xl font-bold text-primary">{completionRate}%</span>
              </div>
              <motion.div
                className="w-full bg-outline-variant border border-outline-variant/30 h-1.5 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${completionRate}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-primary-container h-full"
                />
              </motion.div>
              <p className="text-xs text-on-surface-variant italic mt-4 leading-relaxed">
                “Your team is performing 12% above the quarterly average. Focus on high-priority
                bottlenecks to maintain momentum.”
              </p>
            </div>
          </motion.div>
        </div>

        {/* Task List Column */}
        <div className="md:col-span-7">
          {tasksQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-xl border border-outline-variant animate-pulse"
                />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl border border-outline-variant border-dashed border-2 h-full min-h-[500px] flex flex-col items-center justify-center p-8 transition-all hover:bg-surface-container-low/50"
                >
                  <div className="bg-surface-container-highest p-6 rounded-full mb-6">
                    <FilterX size={48} className="text-on-surface-variant opacity-60" />
                  </div>
                  <h5 className="text-xl font-bold text-primary mb-2">No tasks match your filters</h5>
                  <p className="text-on-surface-variant max-w-sm mb-8 text-sm text-center">
                    Try adjusting your search criteria or reset the filters to see all available
                    tasks in your workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("")
                      setStatusFilter("all")
                      setSortBy("newest")
                    }}
                    className="border border-outline-variant px-8 py-3 rounded font-display text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors active:scale-95"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div layout className="space-y-4">
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm transition-all hover:shadow-md hover:border-primary-container/30 flex justify-between items-start gap-4"
                    >
                      <div>
                        <motion.div
                          className="flex items-center gap-3 mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-tighter ${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700"
                                : task.priority === "medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {task.priority === "high"
                              ? Priority.HIGH
                              : task.priority === "medium"
                                ? Priority.MEDIUM
                                : Priority.LOW}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                            {task.status === "todo"
                              ? TaskStatus.TODO
                              : task.status === "in_progress"
                                ? TaskStatus.IN_PROGRESS
                                : TaskStatus.COMPLETED}
                          </span>
                        </motion.div>
                        <h6 className="font-bold text-primary mb-1">{task.title}</h6>
                        <p className="text-sm text-on-surface-variant line-clamp-2 max-w-lg">
                          {task.description}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-outline uppercase shrink-0">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}
