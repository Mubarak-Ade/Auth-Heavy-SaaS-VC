import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function ResetPasswordPage() {
    const { resetPasswordMutation } = useAuth();
    const [searchParams] = useSearchParams();
    const presetToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
    const [token, setToken] = useState(presetToken);
    const [newPassword, setNewPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        try {
            await resetPasswordMutation.mutateAsync({ token, newPassword });
            setSuccess(true);
            setNewPassword("");
        }
        catch {
            setError("Reset failed. The token may be invalid or expired.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card stack", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("h1", { children: "Reset password" }), _jsx("p", { className: "muted", children: "Enter the reset token and choose a new password." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Reset token" }), _jsx("input", { value: token, onChange: (event) => setToken(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "New password" }), _jsx("input", { value: newPassword, onChange: (event) => setNewPassword(event.target.value), type: "password" })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, success ? _jsx("p", { className: "success-text", children: "Password updated. You can log in now." }) : null, _jsx("button", { type: "submit", disabled: resetPasswordMutation.isPending, children: resetPasswordMutation.isPending ? "Resetting..." : "Reset password" }), _jsxs("p", { className: "muted", children: ["Back to ", _jsx(Link, { to: "/login", children: "login" })] })] }) }));
}
