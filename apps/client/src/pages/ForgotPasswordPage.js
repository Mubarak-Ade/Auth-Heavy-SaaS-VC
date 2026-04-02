import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function ForgotPasswordPage() {
    const { forgotPasswordMutation } = useAuth();
    const [email, setEmail] = useState("");
    const [submittedToken, setSubmittedToken] = useState(null);
    const [error, setError] = useState(null);
    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        try {
            const result = await forgotPasswordMutation.mutateAsync({ email });
            setSubmittedToken(result.resetToken ?? null);
        }
        catch {
            setError("Could not request a reset right now.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card stack", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("h1", { children: "Forgot password" }), _jsx("p", { className: "muted", children: "Request a reset token for your account." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), type: "email" })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, submittedToken ? (_jsxs("div", { className: "card surface-muted", children: [_jsx("p", { className: "muted", children: "Reset token for local testing:" }), _jsx("code", { children: submittedToken })] })) : null, _jsx("button", { type: "submit", disabled: forgotPasswordMutation.isPending, children: forgotPasswordMutation.isPending ? "Requesting..." : "Send reset request" }), _jsxs("p", { className: "muted", children: ["Back to ", _jsx(Link, { to: "/login", children: "login" })] })] }) }));
}
