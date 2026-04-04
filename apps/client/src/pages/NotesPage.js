import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNoteMutations, useNotesQuery } from "../hooks/useWorkspace";
import { noteFormSchema } from "../lib/form-schemas";
import { useUiStore } from "../store/ui-store";
export function NotesPage() {
    const pushToast = useUiStore((state) => state.pushToast);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [search, setSearch] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("updated");
    const notesQuery = useNotesQuery();
    const { createNoteMutation, updateNoteMutation, deleteNoteMutation } = useNoteMutations();
    const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreateForm, formState: { errors: createErrors } } = useForm({
        resolver: zodResolver(noteFormSchema),
        defaultValues: {
            title: "",
            content: "",
            visibility: "org"
        }
    });
    const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEditForm, formState: { errors: editErrors } } = useForm({
        resolver: zodResolver(noteFormSchema),
        defaultValues: {
            title: "",
            content: "",
            visibility: "org"
        }
    });
    async function handleCreateNote(values) {
        await createNoteMutation.mutateAsync(values);
        resetCreateForm();
        pushToast({ title: "Note created", tone: "success" });
    }
    function startEditing(note) {
        setEditingNoteId(note.id);
        resetEditForm(note);
    }
    async function handleUpdateNote(values) {
        if (!editingNoteId)
            return;
        await updateNoteMutation.mutateAsync({
            noteId: editingNoteId,
            patch: values
        });
        setEditingNoteId(null);
        resetEditForm();
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
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Notes" }), _jsx("p", { className: "muted", children: "Workspace pages for lightweight documentation and collaboration." })] }), _jsxs("div", { className: "card filters-grid", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Search" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search notes" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { value: visibilityFilter, onChange: (event) => setVisibilityFilter(event.target.value), children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Sort" }), _jsxs("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), children: [_jsx("option", { value: "updated", children: "Recently updated" }), _jsx("option", { value: "title", children: "Title" })] })] })] }), _jsxs("form", { className: "card stack", onSubmit: handleCreateSubmit(handleCreateNote), children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Title" }), _jsx("input", { ...registerCreate("title") }), createErrors.title ? _jsx("p", { className: "error-text", children: createErrors.title.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Content" }), _jsx("input", { ...registerCreate("content") }), createErrors.content ? _jsx("p", { className: "error-text", children: createErrors.content.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { ...registerCreate("visibility"), children: [_jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsx("button", { type: "submit", disabled: createNoteMutation.isPending, children: createNoteMutation.isPending ? "Saving..." : "Create note" })] }), notesQuery.isLoading ? _jsx("div", { className: "card", children: "Loading notes..." }) : null, notesQuery.isError ? _jsx("div", { className: "card error-text", children: "Could not load notes right now." }) : null, _jsxs("div", { className: "stack", children: [filteredNotes.map((note) => (_jsx("article", { className: "card stack", children: editingNoteId === note.id ? (_jsxs("form", { className: "stack", onSubmit: handleEditSubmit(handleUpdateNote), children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Title" }), _jsx("input", { ...registerEdit("title") }), editErrors.title ? _jsx("p", { className: "error-text", children: editErrors.title.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Content" }), _jsx("textarea", { ...registerEdit("content"), rows: 6 }), editErrors.content ? _jsx("p", { className: "error-text", children: editErrors.content.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Visibility" }), _jsxs("select", { ...registerEdit("visibility"), children: [_jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "org", children: "Org" }), _jsx("option", { value: "public", children: "Public" })] })] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "submit", children: "Save changes" }), _jsx("button", { type: "button", onClick: () => { setEditingNoteId(null); resetEditForm(); }, children: "Cancel" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h3", { children: note.title }), _jsx("p", { children: note.content || "No content" })] }), _jsxs("p", { className: "muted", children: ["Visibility: ", note.visibility] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "button", onClick: () => startEditing(note), children: "Edit" }), _jsx("button", { type: "button", onClick: () => void updateNoteMutation
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
