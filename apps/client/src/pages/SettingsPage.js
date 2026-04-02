import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
export function SettingsPage() {
    const { sessionsQuery } = useAuth();
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Settings" }), _jsx("p", { className: "muted", children: "Organization settings, profile, sessions, and future billing controls." })] }), _jsxs("div", { className: "stack", children: [sessionsQuery.data?.map((session) => (_jsxs("article", { className: "card", children: [_jsx("h3", { children: session.userAgent ?? "Unknown device" }), _jsxs("p", { className: "muted", children: ["IP: ", session.ip ?? "Unknown", " | Expires: ", new Date(session.expiresAt).toLocaleString()] })] }, session.id))), !sessionsQuery.data?.length ? (_jsx("div", { className: "card", children: _jsx("p", { children: "No active sessions to show." }) })) : null] })] }));
}
