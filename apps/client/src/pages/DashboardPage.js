import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDashboardQuery } from "../hooks/useWorkspace";
export function DashboardPage() {
    const dashboardQuery = useDashboardQuery();
    const metrics = dashboardQuery.data;
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Dashboard" }), _jsx("p", { className: "muted", children: "Overview of tasks, notes, and workspace activity." })] }), _jsxs("div", { className: "grid", children: [_jsxs("article", { className: "card", children: [_jsx("h3", { children: "Open tasks" }), _jsx("p", { children: metrics?.openTasks ?? 0 })] }), _jsxs("article", { className: "card", children: [_jsx("h3", { children: "Completed this week" }), _jsx("p", { children: metrics?.completedTasks ?? 0 })] }), _jsxs("article", { className: "card", children: [_jsx("h3", { children: "Notes" }), _jsx("p", { children: metrics?.totalNotes ?? 0 })] }), _jsxs("article", { className: "card", children: [_jsx("h3", { children: "Total tasks" }), _jsx("p", { children: metrics?.totalTasks ?? 0 })] })] })] }));
}
