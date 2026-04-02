import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNoteMutations, useNotesQuery } from "../hooks/useWorkspace";
export function NotesPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState("org");
    const notesQuery = useNotesQuery();
    const { createNoteMutation, updateNoteMutation, deleteNoteMutation } = useNoteMutations();
    async function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim())
            return;
        await createNoteMutation.mutateAsync({ title, content, visibility });
        setTitle("");
        setContent("");
        setVisibility("org");
    }
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Notes" }), _jsx("p", { className: "muted", children: "Workspace pages for lightweight documentation and collaboration." })] }), _jsxs("form", { className: "card stack", onSubmit: handleSubmit, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Title" }), _jsx("input", { value: title, onChange: (event) => setTitle(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Content" }), _jsx("input", { value: content, onChange: (event) => setContent(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { value: visibility, onChange: (event) => setVisibility(event.target.value), children: [_jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsx("button", { type: "submit", disabled: createNoteMutation.isPending, children: createNoteMutation.isPending ? "Saving..." : "Create note" })] }), _jsxs("div", { className: "stack", children: [notesQuery.data?.map((note) => (_jsxs("article", { className: "card stack", children: [_jsxs("div", { children: [_jsx("h3", { children: note.title }), _jsx("p", { children: note.content || "No content" })] }), _jsxs("p", { className: "muted", children: ["Visibility: ", note.visibility] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "button", onClick: () => void updateNoteMutation.mutateAsync({
                                            noteId: note.id,
                                            patch: {
                                                visibility: note.visibility === "org" ? "private" : "org"
                                            }
                                        }), children: "Toggle visibility" }), _jsx("button", { type: "button", onClick: () => void deleteNoteMutation.mutateAsync(note.id), children: "Delete" })] })] }, note.id))), !notesQuery.data?.length ? _jsx("div", { className: "card", children: "No notes yet." }) : null] })] }));
}
