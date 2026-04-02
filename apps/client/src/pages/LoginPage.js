import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function LoginPage() {
    const { loginMutation } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [email, setEmail] = useState("demo@example.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState(null);
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            await loginMutation.mutateAsync({ email, password });
            navigate(inviteToken ? `/invite?token=${encodeURIComponent(inviteToken)}` : (location.state?.from?.pathname ?? "/"));
        }
        catch {
            setError("Login failed. Check your credentials and try again.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("h1", { children: "Welcome back" }), _jsx("p", { className: "muted", children: "Log in to your workspace." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), type: "email" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Password" }), _jsx("input", { value: password, onChange: (event) => setPassword(event.target.value), type: "password" })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { type: "submit", disabled: loginMutation.isPending, children: loginMutation.isPending ? "Logging in..." : "Login" }), _jsxs("div", { className: "auth-links", children: [_jsx(Link, { to: inviteToken ? `/register?invite=${encodeURIComponent(inviteToken)}` : "/register", children: "Create account" }), _jsx(Link, { to: "/forgot-password", children: "Forgot password?" })] })] }) }));
}
