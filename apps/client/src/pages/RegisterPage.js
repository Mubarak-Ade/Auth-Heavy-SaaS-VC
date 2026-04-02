import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInvite } from "../hooks/useInvite";
export function RegisterPage() {
    const { registerMutation } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const { inviteQuery } = useInvite(inviteToken);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    useEffect(() => {
        if (inviteQuery.data?.invite.email) {
            setEmail(inviteQuery.data.invite.email);
        }
    }, [inviteQuery.data]);
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            await registerMutation.mutateAsync({
                name,
                email,
                password,
                inviteToken: inviteToken ?? undefined
            });
            navigate("/");
        }
        catch {
            setError("Registration failed. Try a different email or stronger password.");
        }
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("form", { className: "card auth-card stack", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("h1", { children: "Create your account" }), _jsx("p", { className: "muted", children: inviteQuery.data
                                ? `Join ${inviteQuery.data.organization.name} and get signed in immediately.`
                                : "Start your workspace and get signed in immediately." })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Name" }), _jsx("input", { value: name, onChange: (event) => setName(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), type: "email" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Password" }), _jsx("input", { value: password, onChange: (event) => setPassword(event.target.value), type: "password" })] }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { type: "submit", disabled: registerMutation.isPending, children: registerMutation.isPending ? "Creating account..." : "Register" }), _jsxs("p", { className: "muted", children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Log in" })] })] }) }));
}
