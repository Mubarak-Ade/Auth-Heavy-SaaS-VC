import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginFormSchema } from "../lib/form-schemas";
export function LoginPage() {
    const { loginMutation } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [error, setError] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "demo@example.com",
            password: "password123"
        }
    });
    async function onSubmit(values) {
        setError(null);
        try {
            await loginMutation.mutateAsync(values);
            navigate(inviteToken ? `/invite?token=${encodeURIComponent(inviteToken)}` : (location.state?.from?.pathname ?? "/"));
        }
        catch {
            setError("Login failed. Check your credentials and try again.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { children: [_jsx("h1", { children: "Welcome back" }), _jsx("p", { className: "muted", children: "Log in to your workspace." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { ...register("email"), type: "email" }), errors.email ? _jsx("p", { className: "error-text", children: errors.email.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Password" }), _jsx("input", { ...register("password"), type: "password" }), errors.password ? _jsx("p", { className: "error-text", children: errors.password.message }) : null] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { type: "submit", disabled: loginMutation.isPending, children: loginMutation.isPending ? "Logging in..." : "Login" }), _jsxs("div", { className: "auth-links", children: [_jsx(Link, { to: inviteToken ? `/register?invite=${encodeURIComponent(inviteToken)}` : "/register", children: "Create account" }), _jsx(Link, { to: "/forgot-password", children: "Forgot password?" })] })] }) }));
}
