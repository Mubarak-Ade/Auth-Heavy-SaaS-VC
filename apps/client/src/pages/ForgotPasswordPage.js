import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { forgotPasswordFormSchema } from "../lib/form-schemas";
export function ForgotPasswordPage() {
    const { forgotPasswordMutation } = useAuth();
    const [submittedToken, setSubmittedToken] = useState(null);
    const [error, setError] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: {
            email: ""
        }
    });
    async function onSubmit(values) {
        setError(null);
        try {
            const result = await forgotPasswordMutation.mutateAsync(values);
            setSubmittedToken(result.resetToken ?? null);
        }
        catch {
            setError("Could not request a reset right now.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card stack", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { children: [_jsx("h1", { children: "Forgot password" }), _jsx("p", { className: "muted", children: "Request a reset token for your account." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { ...register("email"), type: "email" }), errors.email ? _jsx("p", { className: "error-text", children: errors.email.message }) : null] }), error ? _jsx("p", { className: "error-text", children: error }) : null, submittedToken ? (_jsxs("div", { className: "card surface-muted", children: [_jsx("p", { className: "muted", children: "Reset token for local testing:" }), _jsx("code", { children: submittedToken })] })) : null, _jsx("button", { type: "submit", disabled: forgotPasswordMutation.isPending, children: forgotPasswordMutation.isPending ? "Requesting..." : "Send reset request" }), _jsxs("p", { className: "muted", children: ["Back to ", _jsx(Link, { to: "/login", children: "login" })] })] }) }));
}
