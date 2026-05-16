import { useDashboardQuery } from "../hooks/useWorkspace"
import { useAuth } from "../hooks/useAuth"

export function DashboardPage() {
  const dashboardQuery = useDashboardQuery()
  const metrics = dashboardQuery.data
  const { user } = useAuth()

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U"

  return (
    <>
      {/* Hero Dashboard Summary */}
      <section className="bg-primary-container rounded-xl p-10 relative overflow-hidden">
        {/* Background visual texture */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
          <img
            className="object-cover w-full h-full mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJdRlxB6PXqwx9xAqsTrmlDaXGohmN-8R0DonTZoh5VSkeLsYQWEviM6ImIv68z6WDmNQxHnPb8b1Lz6c02_xKr23fgPHka9fsDQ3nAXpio-3KD-K-31ApDj7H5453KqXaD1sFuenuj-6YmV6MJozpvrv9gOHvRoILc24KOmM56JpxbiE_cSR_mCB7qd3ciFUx-UeYDBzDt-a5-SHvJ4Jvi52zbFXZ0UnGN_DZKtbAlmn34ukBaW7qr_13s0sUcgSvrOPRWnvv1G-u"
            alt="Abstract background"
          />
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="font-headline-lg text-[32px] font-semibold text-on-primary-fixed leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="font-body-lg text-[18px] text-on-primary-container/80 max-w-2xl leading-relaxed">
            Overview of tasks, notes, and workspace activity. Keep the team moving by tracking open
            work, completed work, and the knowledge base in one place.
          </p>
        </div>
      </section>

      {/* Loading / Error States */}
      {dashboardQuery.isLoading && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white ghost-border p-8 rounded-xl flex flex-col justify-between h-40 animate-pulse">
              <div className="h-3 w-24 bg-surface-container-high rounded" />
              <div className="h-10 w-16 bg-surface-container-high rounded" />
            </div>
          ))}
        </section>
      )}

      {dashboardQuery.isError && (
        <div className="bg-error-container text-on-error-container p-6 rounded-xl font-body-md text-[15px]">
          <span className="material-symbols-outlined text-[18px] align-middle mr-2">error</span>
          Could not load dashboard metrics. Please try again.
        </div>
      )}

      {/* Metrics Grid */}
      {!dashboardQuery.isLoading && !dashboardQuery.isError && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white ghost-border p-8 rounded-xl flex flex-col justify-between h-40 group hover:border-primary-container/30 transition-all">
            <span className="font-label-sm text-[12px] text-on-secondary-container tracking-wider">
              Open tasks
            </span>
            <span className="font-display text-[48px] leading-none font-bold text-primary tracking-tight">
              {metrics?.openTasks ?? 0}
            </span>
          </div>
          <div className="bg-white ghost-border p-8 rounded-xl flex flex-col justify-between h-40 group hover:border-primary-container/30 transition-all">
            <span className="font-label-sm text-[12px] text-on-secondary-container tracking-wider">
              Completed this week
            </span>
            <span className="font-display text-[48px] leading-none font-bold text-primary tracking-tight">
              {metrics?.completedTasks ?? 0}
            </span>
          </div>
          <div className="bg-white ghost-border p-8 rounded-xl flex flex-col justify-between h-40 group hover:border-primary-container/30 transition-all">
            <span className="font-label-sm text-[12px] text-on-secondary-container tracking-wider">
              Notes
            </span>
            <span className="font-display text-[48px] leading-none font-bold text-primary tracking-tight">
              {metrics?.totalNotes ?? 0}
            </span>
          </div>
          <div className="bg-white ghost-border p-8 rounded-xl flex flex-col justify-between h-40 group hover:border-primary-container/30 transition-all">
            <span className="font-label-sm text-[12px] text-on-secondary-container tracking-wider">
              Total tasks
            </span>
            <span className="font-display text-[48px] leading-none font-bold text-primary tracking-tight">
              {metrics?.totalTasks ?? 0}
            </span>
          </div>
        </section>
      )}

      {/* Two Column Layout: Recent Tasks & Notes */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Tasks (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-md text-[20px] font-semibold text-primary">Recent Tasks</h2>
            <a
              href="/tasks"
              className="font-label-sm text-[12px] text-outline hover:text-primary-container transition-colors no-underline tracking-wider"
            >
              View All
            </a>
          </div>
          <div className="bg-white ghost-border rounded-xl overflow-hidden">
            <div className="p-8 space-y-6">
              {/* Placeholder task item */}
              <div className="flex items-start gap-4 p-4 hover:bg-surface-container-low rounded-lg group transition-all cursor-pointer">
                <div className="mt-1">
                  <div className="w-5 h-5 border-2 border-outline-variant rounded-sm group-hover:border-primary-container transition-colors" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-body-md text-[15px] font-semibold text-primary">
                      Initialize Nexus Workspace structure
                    </h4>
                    <span className="bg-secondary-container text-on-secondary-fixed-variant px-2 py-0.5 rounded-sm font-label-sm text-[10px] uppercase tracking-widest">
                      High
                    </span>
                  </div>
                  <p className="font-body-md text-[15px] text-outline leading-relaxed">
                    Setup basic layout structure and design tokens according to the sophisticated
                    minimalism guidelines.
                  </p>
                  <div className="pt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-label-sm text-[12px] text-outline">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      Today
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-outline-variant border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        {userInitial}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty state skeleton */}
              <div className="opacity-20 flex items-center gap-4 p-4 border border-dashed border-outline-variant rounded-lg">
                <div className="w-5 h-5 border-2 border-outline-variant rounded-sm" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-outline-variant rounded" />
                  <div className="h-2 w-full bg-outline-variant rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-md text-[20px] font-semibold text-primary">Recent Notes</h2>
            <a
              href="/notes"
              className="font-label-sm text-[12px] text-outline hover:text-primary-container transition-colors no-underline tracking-wider"
            >
              Manage Docs
            </a>
          </div>
          <div className="bg-white ghost-border rounded-xl h-full flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-3xl">description</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-body-lg text-[18px] font-semibold text-primary">No recent notes</h4>
              <p className="font-body-md text-[15px] text-outline max-w-[240px]">
                Your collaborative knowledge base is currently empty.
              </p>
            </div>
            <a
              href="/notes"
              className="ghost-border text-primary font-button text-[14px] px-6 py-2 rounded-lg hover:bg-surface-container-low transition-all no-underline tracking-wide"
            >
              Create First Note
            </a>
          </div>
        </div>
      </section>

      {/* Activity / Members Section (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white ghost-border p-8 rounded-xl space-y-6">
          <h3 className="font-headline-md text-[20px] font-semibold text-primary">Workspace Activity</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                {userInitial}
              </div>
              <div className="space-y-1">
                <p className="font-body-md text-[15px] text-primary">
                  <span className="font-bold">{user?.name ?? "User"}</span> created the project{" "}
                  <span className="italic">"Initial Setup"</span>
                </p>
                <p className="font-label-sm text-[12px] text-outline">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                S
              </div>
              <div className="space-y-1">
                <p className="font-body-md text-[15px] text-primary">
                  <span className="font-bold">System</span> updated Workspace Plan to{" "}
                  <span className="font-bold">Pro</span>
                </p>
                <p className="font-label-sm text-[12px] text-outline">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-fixed/30 p-8 rounded-xl flex flex-col justify-between min-h-[200px]">
          <div className="space-y-4">
            <h3 className="font-headline-md text-[20px] font-semibold text-primary">Team</h3>
            <p className="font-body-md text-[15px] text-on-primary-container/70">
              Invite your colleagues to start collaborating on tasks.
            </p>
          </div>
          <a href="/members" className="flex items-center gap-2 no-underline mt-6">
            <div className="w-8 h-8 rounded-full border border-white bg-white/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">add</span>
            </div>
            <span className="font-button text-[14px] text-primary cursor-pointer hover:underline tracking-wide">
              Manage Members
            </span>
          </a>
        </div>
      </section>
    </>
  )
}
