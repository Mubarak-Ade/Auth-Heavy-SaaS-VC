import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useTaskMutations, useTasksQuery } from "../hooks/useWorkspace";
import { useUiStore } from "../store/ui-store";
export function TasksPage() {
    const pushToast = useUiStore((state) => state.pushToast);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingDescription, setEditingDescription] = useState("");
    const [editingPriority, setEditingPriority] = useState("medium");
    const [editingStatus, setEditingStatus] = useState("todo");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const tasksQuery = useTasksQuery();
    const { createTaskMutation, updateTaskMutation, deleteTaskMutation } = useTaskMutations();
    async function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim())
            return;
        await createTaskMutation.mutateAsync({
            title,
            description,
            priority
        });
        setTitle("");
        setDescription("");
        setPriority("medium");
        pushToast({ title: "Task created", tone: "success" });
    }
    function startEditing(task) {
        setEditingTaskId(task.id);
        setEditingTitle(task.title);
        setEditingDescription(task.description);
        setEditingPriority(task.priority);
        setEditingStatus(task.status);
    }
    async function handleUpdateTask(event) {
        event.preventDefault();
        if (!editingTaskId)
            return;
        await updateTaskMutation.mutateAsync({
            taskId: editingTaskId,
            patch: {
                title: editingTitle,
                description: editingDescription,
                priority: editingPriority,
                status: editingStatus
            }
        });
        setEditingTaskId(null);
        pushToast({ title: "Task updated", tone: "success" });
    }
    const filteredTasks = [...(tasksQuery.data ?? [])]
        .filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
        return matchesSearch && matchesStatus;
    })
        .sort((left, right) => {
        if (sortBy === "priority") {
            const rank = { low: 0, medium: 1, high: 2 };
            return rank[right.priority] - rank[left.priority];
        }
        if (sortBy === "status") {
            const rank = { todo: 0, in_progress: 1, done: 2 };
            return rank[left.status] - rank[right.status];
        }
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Tasks" }), _jsx("p", { className: "muted", children: "Track assignments, priorities, and progress." })] }), _jsxs("div", { className: "card filters-grid", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Search" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search tasks" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Status" }), _jsxs("select", { value: statusFilter, onChange: (event) => setStatusFilter(event.target.value), children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "todo", children: "Todo" }), _jsx("option", { value: "in_progress", children: "In progress" }), _jsx("option", { value: "done", children: "Done" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Sort" }), _jsxs("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), children: [_jsx("option", { value: "newest", children: "Newest" }), _jsx("option", { value: "priority", children: "Priority" }), _jsx("option", { value: "status", children: "Status" })] })] })] }), _jsxs("form", { className: "card stack", onSubmit: handleSubmit, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Task title" }), _jsx("input", { value: title, onChange: (event) => setTitle(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Description" }), _jsx("input", { value: description, onChange: (event) => setDescription(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Priority" }), _jsxs("select", { value: priority, onChange: (event) => setPriority(event.target.value), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsx("button", { type: "submit", disabled: createTaskMutation.isPending, children: createTaskMutation.isPending ? "Saving..." : "Create task" })] }), tasksQuery.isLoading ? _jsx("div", { className: "card", children: "Loading tasks..." }) : null, tasksQuery.isError ? _jsx("div", { className: "card error-text", children: "Could not load tasks right now." }) : null, _jsxs("div", { className: "stack", children: [filteredTasks.map((task) => (_jsx("article", { className: "card stack", children: editingTaskId === task.id ? (_jsxs("form", { className: "stack", onSubmit: handleUpdateTask, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Title" }), _jsx("input", { value: editingTitle, onChange: (event) => setEditingTitle(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Description" }), _jsx("textarea", { value: editingDescription, onChange: (event) => setEditingDescription(event.target.value), rows: 4 })] }), _jsxs("div", { className: "row", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Priority" }), _jsxs("select", { value: editingPriority, onChange: (event) => setEditingPriority(event.target.value), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Status" }), _jsxs("select", { value: editingStatus, onChange: (event) => setEditingStatus(event.target.value), children: [_jsx("option", { value: "todo", children: "Todo" }), _jsx("option", { value: "in_progress", children: "In progress" }), _jsx("option", { value: "done", children: "Done" })] })] })] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "submit", children: "Save changes" }), _jsx("button", { type: "button", onClick: () => setEditingTaskId(null), children: "Cancel" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h3", { children: task.title }), _jsx("p", { className: "muted", children: task.description || "No description" })] }), _jsxs("p", { children: ["Status: ", _jsx("strong", { children: task.status }), " | Priority: ", _jsx("strong", { children: task.priority })] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "button", onClick: () => startEditing(task), children: "Edit" }), _jsx("button", { type: "button", onClick: () => void updateTaskMutation
                                                .mutateAsync({
                                                taskId: task.id,
                                                patch: { status: task.status === "done" ? "todo" : "done" }
                                            })
                                                .then(() => pushToast({ title: "Task status updated", tone: "success" })), children: "Toggle status" }), _jsx("button", { type: "button", onClick: () => void deleteTaskMutation
                                                .mutateAsync(task.id)
                                                .then(() => pushToast({ title: "Task deleted", tone: "info" })), children: "Delete" })] })] })) }, task.id))), !filteredTasks.length && !tasksQuery.isLoading ? _jsx("div", { className: "card", children: "No tasks match your filters." }) : null] })] }));
}
