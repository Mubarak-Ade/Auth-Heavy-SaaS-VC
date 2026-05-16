import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { Lightbulb, SearchX } from "lucide-react"

import { useNoteMutations, useNotesQuery } from "../hooks/useWorkspace"
import { noteFormSchema, type NoteFormValues } from "../lib/form-schemas"
import { useUiStore } from "../store/ui-store"

const visibilityFilterValues = ["all", "private", "org", "public"] as const
const sortValues = ["updated", "title"] as const

type VisibilityFilter = (typeof visibilityFilterValues)[number]
type SortBy = (typeof sortValues)[number]

const visibilityFilterLabels: Record<VisibilityFilter, string> = {
  all: "All",
  private: "Private",
  org: "Org",
  public: "Public"
}

const visibilityLabels: Record<"private" | "org" | "public", string> = {
  private: "Private",
  org: "Org",
  public: "Public"
}

const sortLabels: Record<SortBy, string> = {
  updated: "Recently updated",
  title: "Alphabetical"
}

const COLLAB_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCEjDzv6zODkaxtWxSphzZIwhA-7QP1jfeGDJPMGNsxr82OO7Nh1sEgb-a1_8WOkoQ8nXSXe-bPO0wLHKoPccYfTlgO7bVyvtsYnGrUU22pNEIP_YBNUD-jYQcI38BTopet-6skoLxORI0r5Ppf8ROWihIoO_Yc2phYgzbaEJ7SkQ_M4QyHmz_2JZIUaaKJIm9zpNDSm5ZTJdwlLmL4wZ-zhDwJ7muOzCIBJ3-op00BzJvcTw8WHrKdvnJr-oJckJh29WvllRgYxPs_"

export function NotesPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("updated")

  const notesQuery = useNotesQuery()
  const { createNoteMutation, deleteNoteMutation } = useNoteMutations()

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors }
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      visibility: "org"
    }
  })

  async function handleCreateNote(values: NoteFormValues) {
    await createNoteMutation.mutateAsync(values)
    resetCreateForm()
    pushToast({ title: "Note created", tone: "success" })
  }

  function clearFilters() {
    setSearch("")
    setVisibilityFilter("all")
    setSortBy("updated")
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Notes</h1>
        <p className="text-on-surface-variant max-w-2xl text-[15px]">
          Workspace pages for lightweight documentation and collaboration.
        </p>
      </header>

      {/* Filters Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 items-end bg-white p-8 rounded-xl border border-outline-variant"
      >
        <div className="md:col-span-6 flex flex-col gap-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded text-sm"
            placeholder="Search notes..."
            type="text"
          />
        </div>
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Visibility
          </label>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
            className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded bg-white appearance-none text-sm"
          >
            {visibilityFilterValues.map((value) => (
              <option key={value} value={value}>
                {visibilityFilterLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded bg-white appearance-none text-sm"
          >
            {sortValues.map((value) => (
              <option key={value} value={value}>
                {sortLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Two-Column Layout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {/* New Draft Card */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white p-8 rounded-xl border border-outline-variant shadow-sm"
          >
            <h3 className="text-xl font-bold text-primary mb-6">New Draft</h3>
            <form className="space-y-6" onSubmit={handleCreateSubmit(handleCreateNote)}>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Title
                </label>
                <input
                  {...registerCreate("title")}
                  className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded text-sm"
                  placeholder="Note title"
                  type="text"
                />
                {createErrors.title && (
                  <p className="text-error text-xs">{createErrors.title.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Content
                </label>
                <textarea
                  {...registerCreate("content")}
                  className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded resize-none text-sm min-h-[140px]"
                  placeholder="Start writing..."
                  rows={5}
                />
                {createErrors.content && (
                  <p className="text-error text-xs">{createErrors.content.message}</p>
                )}
              </div>
              <motion.div className="flex flex-col gap-2" layout>
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Visibility
                </label>
                <select
                  {...registerCreate("visibility")}
                  className="w-full px-4 py-3 border border-outline-variant focus:border-primary-container outline-none transition-all rounded bg-white appearance-none text-sm"
                >
                  <option value="private">Private</option>
                  <option value="org">Org</option>
                  <option value="public">Public</option>
                </select>
              </motion.div>
              <motion.button
                type="submit"
                disabled={createNoteMutation.isPending}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-container text-white py-4 rounded font-display text-sm font-semibold hover:opacity-95 transition-all shadow-sm disabled:opacity-50"
              >
                {createNoteMutation.isPending ? "Creating..." : "Create note"}
              </motion.button>
            </form>
          </motion.div>

          {/* Pro Tip Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="bg-surface-container-low p-6 rounded-xl border border-dashed border-outline-variant"
          >
            <div className="flex items-start gap-3">
              <Lightbulb size={18} className="text-primary-container shrink-0 mt-0.5" />
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="font-mono text-[10px] text-primary-container uppercase tracking-widest font-bold block mb-2">
                  Pro tip
                </span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Use Markdown shortcuts like <span className="font-mono text-primary">#</span> for
                  headers or <span className="font-mono text-primary">-</span> for lists to format
                  your notes instantly.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 flex flex-col gap-8">
          {notesQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-surface-container-low rounded-xl border border-dashed border-outline-variant animate-pulse"
                />
              ))}
            </div>
          ) : notesQuery.isError ? (
            <div className="bg-error-container text-on-error-container p-6 rounded-xl text-sm">
              Could not load notes.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotes.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface-container-low rounded-xl border border-dashed border-2 border-outline-variant min-h-[360px] flex flex-col items-center justify-center p-10 text-center"
                >
                  <div className="bg-surface-container-highest p-6 rounded-full mb-6">
                    <SearchX size={40} className="text-on-surface-variant opacity-60" />
                  </div>
                  <h5 className="text-xl font-bold text-primary mb-2">No notes match your filters</h5>
                  <p className="text-on-surface-variant max-w-sm mb-8 text-sm">
                    Try adjusting your visibility settings or search term to find what you&apos;re
                    looking for.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="border border-outline-variant px-6 py-2.5 rounded font-display text-sm font-semibold text-primary hover:bg-white transition-colors active:scale-95"
                    >
                      Clear all filters
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        pushToast({ title: "Archive view coming soon", tone: "info" })
                      }
                      className="border border-outline-variant px-6 py-2.5 rounded font-display text-sm font-semibold text-primary hover:bg-white transition-colors active:scale-95"
                    >
                      View Archive
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div layout className="space-y-4">
                  {filteredNotes.map((note) => (
                    <motion.article
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm transition-all hover:shadow-md hover:border-primary-container/30 group"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-tighter bg-surface-container-high text-on-surface-variant shrink-0">
                            {visibilityLabels[note.visibility]}
                          </span>
                          <h6 className="font-bold text-primary truncate">{note.title}</h6>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => void deleteNoteMutation.mutateAsync(note.id)}
                            className="p-2 hover:bg-error-container/30 rounded text-outline hover:text-error transition-colors"
                            aria-label="Delete note"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                        {note.content || "No additional content."}
                      </p>
                      <div className="text-[10px] font-mono text-outline uppercase">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
        </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Collaborative Writing Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ scale: 1.005 }}
            className="relative overflow-hidden rounded-xl border border-outline-variant bg-white min-h-[120px]"
          >
            <img
              src={COLLAB_HERO_IMAGE}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-right opacity-[0.12] grayscale"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 z-10" />
            <div className="relative z-20 p-8 max-w-md">
              <h4 className="text-lg font-bold text-primary mb-2">Collaborative Writing</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Notes are better shared. Invite your team to edit together in real-time.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
