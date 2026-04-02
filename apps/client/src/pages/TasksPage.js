import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useTaskMutations, useTasksQuery } from "../hooks/useWorkspace";
export function TasksPage() {
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
    }
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Tasks" }), _jsx("p", { className: "muted", children: "Track assignments, priorities, and progress." })] }), _jsxs("form", { className: "card stack", onSubmit: handleSubmit, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Task title" }), _jsx("input", { value: title, onChange: (event) => setTitle(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Description" }), _jsx("input", { value: description, onChange: (event) => setDescription(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Priority" }), _jsxs("select", { value: priority, onChange: (event) => setPriority(event.target.value), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsx("button", { type: "submit", disabled: createTaskMutation.isPending, children: createTaskMutation.isPending ? "Saving..." : "Create task" })] }), _jsxs("div", { className: "stack", children: [tasksQuery.data?.map((task) => (_jsxs("article", { className: "card stack", children: [_jsxs("div", { children: [_jsx("h3", { children: task.title }), _jsx("p", { className: "muted", children: task.description || "No description" })] }), _jsxs("p", { children: ["Status: ", _jsx("strong", { children: task.status }), " | Priority: ", _jsx("strong", { children: task.priority })] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "button", onClick: () => void updateTaskMutation.mutateAsync({
                                            taskId: task.id,
                                            patch: { status: task.status === "done" ? "todo" : "done" }
                                        }), children: "Toggle status" }), _jsx("button", { type: "button", onClick: () => void deleteTaskMutation.mutateAsync(task.id), children: "Delete" })] })] }, task.id))), !tasksQuery.data?.length ? _jsx("div", { className: "card", children: "No tasks yet." }) : null] })] }));
}
