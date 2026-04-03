import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNoteMutations, useNotesQuery } from "../hooks/useWorkspace";
import { useUiStore } from "../store/ui-store";
export function NotesPage() {
    const pushToast = useUiStore((state) => state.pushToast);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingContent, setEditingContent] = useState("");
    const [editingVisibility, setEditingVisibility] = useState("org");
    const [search, setSearch] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("updated");
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
        pushToast({ title: "Note created", tone: "success" });
    }
    function startEditing(note) {
        setEditingNoteId(note.id);
        setEditingTitle(note.title);
        setEditingContent(note.content);
        setEditingVisibility(note.visibility);
    }
    async function handleUpdateNote(event) {
        event.preventDefault();
        if (!editingNoteId)
            return;
        await updateNoteMutation.mutateAsync({
            noteId: editingNoteId,
            patch: {
                title: editingTitle,
                content: editingContent,
                visibility: editingVisibility
            }
        });
        setEditingNoteId(null);
        pushToast({ title: "Note updated", tone: "success" });
    }
    const filteredNotes = [...(notesQuery.data ?? [])]
        .filter((note) => {
        const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) ||
            note.content.toLowerCase().includes(search.toLowerCase());
        const matchesVisibility = visibilityFilter === "all" ? true : note.visibility === visibilityFilter;
        return matchesSearch && matchesVisibility;
    })
        .sort((left, right) => {
        if (sortBy === "title") {
            return left.title.localeCompare(right.title);
        }
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Notes" }), _jsx("p", { className: "muted", children: "Workspace pages for lightweight documentation and collaboration." })] }), _jsxs("div", { className: "card filters-grid", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Search" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search notes" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { value: visibilityFilter, onChange: (event) => setVisibilityFilter(event.target.value), children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Sort" }), _jsxs("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), children: [_jsx("option", { value: "updated", children: "Recently updated" }), _jsx("option", { value: "title", children: "Title" })] })] })] }), _jsxs("form", { className: "card stack", onSubmit: handleSubmit, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Title" }), _jsx("input", { value: title, onChange: (event) => setTitle(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Content" }), _jsx("input", { value: content, onChange: (event) => setContent(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { value: visibility, onChange: (event) => setVisibility(event.target.value), children: [_jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsx("button", { type: "submit", disabled: createNoteMutation.isPending, children: createNoteMutation.isPending ? "Saving..." : "Create note" })] }), notesQuery.isLoading ? _jsx("div", { className: "card", children: "Loading notes..." }) : null, notesQuery.isError ? _jsx("div", { className: "card error-text", children: "Could not load notes right now." }) : null, _jsxs("div", { className: "stack", children: [filteredNotes.map((note) => (_jsx("article", { className: "card stack", children: editingNoteId === note.id ? (_jsxs("form", { className: "stack", onSubmit: handleUpdateNote, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Title" }), _jsx("input", { value: editingTitle, onChange: (event) => setEditingTitle(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Content" }), _jsx("textarea", { value: editingContent, onChange: (event) => setEditingContent(event.target.value), rows: 6 })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { value: editingVisibility, onChange: (event) => setEditingVisibility(event.target.value), children: [_jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "submit", children: "Save changes" }), _jsx("button", { type: "button", onClick: () => setEditingNoteId(null), children: "Cancel" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h3", { children: note.title }), _jsx("p", { children: note.content || "No content" })] }), _jsxs("p", { className: "muted", children: ["Visibility: ", note.visibility] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "button", onClick: () => startEditing(note), children: "Edit" }), _jsx("button", { type: "button", onClick: () => void updateNoteMutation
                                                .mutateAsync({
                                                noteId: note.id,
                                                patch: {
                                                    visibility: note.visibility === "org" ? "private" : "org"
                                                }
                                            })
                                                .then(() => pushToast({ title: "Note visibility updated", tone: "success" })), children: "Toggle visibility" }), _jsx("button", { type: "button", onClick: () => void deleteNoteMutation
                                                .mutateAsync(note.id)
                                                .then(() => pushToast({ title: "Note deleted", tone: "info" })), children: "Delete" })] })] })) }, note.id))), !filteredNotes.length && !notesQuery.isLoading ? _jsx("div", { className: "card", children: "No notes match your filters." }) : null] })] }));
}
