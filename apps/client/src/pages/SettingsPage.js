import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { useOrganizationMutations } from "../hooks/useWorkspace";
import { createOrganizationFormSchema } from "../lib/form-schemas";
export function SettingsPage() {
    const { currentOrgId, currentRole, organizations, revokeAllSessionsMutation, revokeSessionMutation, sessionsQuery, user } = useAuth();
    const { createOrganizationMutation } = useOrganizationMutations();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(createOrganizationFormSchema),
        defaultValues: {
            name: "",
            slug: ""
        }
    });
    async function handleCreateOrganization(values) {
        await createOrganizationMutation.mutateAsync(values);
        reset();
    }
    const currentOrganization = organizations.find((organization) => organization.id === currentOrgId);
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Settings" }), _jsx("p", { className: "muted", children: "Organization settings, profile, sessions, and future billing controls." })] }), _jsxs("div", { className: "grid", children: [_jsxs("article", { className: "card stack", children: [_jsx("h3", { children: "Current workspace" }), _jsx("p", { children: _jsx("strong", { children: currentOrganization?.name ?? "No workspace selected" }) }), _jsxs("p", { className: "muted", children: ["Slug: ", currentOrganization?.slug ?? "n/a"] }), _jsxs("p", { className: "muted", children: ["Your role: ", currentRole ?? "n/a"] }), _jsxs("p", { className: "muted", children: ["Signed in as ", user?.email ?? "unknown"] })] }), _jsxs("form", { className: "card stack", onSubmit: handleSubmit(handleCreateOrganization), children: [_jsx("h3", { children: "Create workspace" }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Name" }), _jsx("input", { ...register("name") }), errors.name ? _jsx("p", { className: "error-text", children: errors.name.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Slug" }), _jsx("input", { ...register("slug") }), errors.slug ? _jsx("p", { className: "error-text", children: errors.slug.message }) : null] }), _jsx("button", { type: "submit", disabled: createOrganizationMutation.isPending, children: createOrganizationMutation.isPending ? "Creating..." : "Create workspace" })] })] }), _jsx("div", { className: "row", children: _jsx("button", { type: "button", onClick: () => void revokeAllSessionsMutation.mutateAsync(), children: "Log out all devices" }) }), _jsxs("div", { className: "stack", children: [sessionsQuery.data?.map((session) => (_jsxs("article", { className: "card stack", children: [_jsx("h3", { children: session.userAgent ?? "Unknown device" }), _jsxs("p", { className: "muted", children: ["IP: ", session.ip ?? "Unknown", " | Expires: ", new Date(session.expiresAt).toLocaleString()] }), _jsx("button", { type: "button", onClick: () => void revokeSessionMutation.mutateAsync(session.id), children: "Revoke session" })] }, session.id))), !sessionsQuery.data?.length ? (_jsx("div", { className: "card", children: _jsx("p", { children: "No active sessions to show." }) })) : null] })] }));
}
