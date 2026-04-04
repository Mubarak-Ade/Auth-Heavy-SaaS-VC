import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInvite } from "../hooks/useInvite";
import { registerFormSchema } from "../lib/form-schemas";
export function RegisterPage() {
    const { registerMutation } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const { inviteQuery } = useInvite(inviteToken);
    const [error, setError] = useState(null);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    });
    useEffect(() => {
        if (inviteQuery.data?.invite.email) {
            setValue("email", inviteQuery.data.invite.email, { shouldValidate: true });
        }
    }, [inviteQuery.data, setValue]);
    async function onSubmit(values) {
        setError(null);
        try {
            await registerMutation.mutateAsync({
                ...values,
                inviteToken: inviteToken ?? undefined
            });
            navigate("/");
        }
        catch {
            setError("Registration failed. Try a different email or stronger password.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card stack", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { children: [_jsx("h1", { children: "Create your account" }), _jsx("p", { className: "muted", children: inviteQuery.data
                                ? `Join ${inviteQuery.data.organization.name} and get signed in immediately.`
                                : "Start your workspace and get signed in immediately." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Name" }), _jsx("input", { ...register("name") }), errors.name ? _jsx("p", { className: "error-text", children: errors.name.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { ...register("email"), type: "email" }), errors.email ? _jsx("p", { className: "error-text", children: errors.email.message }) : null] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Password" }), _jsx("input", { ...register("password"), type: "password" }), errors.password ? _jsx("p", { className: "error-text", children: errors.password.message }) : null] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { type: "submit", disabled: registerMutation.isPending, children: registerMutation.isPending ? "Creating account..." : "Register" }), _jsxs("p", { className: "muted", children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Log in" })] })] }) }));
}
