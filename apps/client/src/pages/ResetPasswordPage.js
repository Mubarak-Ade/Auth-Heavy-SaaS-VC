import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { resetPasswordFormSchema } from "../lib/form-schemas";
export function ResetPasswordPage() {
    const { resetPasswordMutation } = useAuth();
    const [searchParams] = useSearchParams();
    const presetToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: {
            token: presetToken,
            newPassword: ""
        }
    });
    async function onSubmit(values) {
        setError(null);
        try {
            await resetPasswordMutation.mutateAsync(values);
            setSuccess(true);
            reset({ token: values.token, newPassword: "" });
        }
        catch {
            setError("Reset failed. The token may be invalid or expired.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card stack", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { children: [_jsx("h1", { children: "Reset password" }), _jsx("p", { className: "muted", children: "Enter the reset token and choose a new password." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Reset token" }), _jsx("input", { ...register("token") }), errors.token ? _jsx("p", { className: "error-text", children: errors.token.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "New password" }), _jsx("input", { ...register("newPassword"), type: "password" }), errors.newPassword ? _jsx("p", { className: "error-text", children: errors.newPassword.message }) : null] }), error ? _jsx("p", { className: "error-text", children: error }) : null, success ? _jsx("p", { className: "success-text", children: "Password updated. You can log in now." }) : null, _jsx("button", { type: "submit", disabled: resetPasswordMutation.isPending, children: resetPasswordMutation.isPending ? "Resetting..." : "Reset password" }), _jsxs("p", { className: "muted", children: ["Back to ", _jsx(Link, { to: "/login", children: "login" })] })] }) }));
}
