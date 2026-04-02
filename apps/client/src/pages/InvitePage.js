import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInvite } from "../hooks/useInvite";
export function InvitePage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const { user } = useAuth();
    const { acceptInviteMutation, inviteQuery } = useInvite(token);
    async function handleAcceptInvite() {
        if (!user) {
            return;
        }
        await acceptInviteMutation.mutateAsync();
        navigate("/");
    }
    if (!token) {
        return (_jsx("div", { className: "auth-page", children: _jsx("div", { className: "card auth-card", children: _jsx("p", { className: "error-text", children: "Invite token is missing." }) }) }));
    }
    if (inviteQuery.isLoading) {
        return _jsx("div", { className: "centered", children: "Loading invite..." });
    }
    if (inviteQuery.isError || !inviteQuery.data) {
        return (_jsx("div", { className: "auth-page", children: _jsx("div", { className: "card auth-card", children: _jsx("p", { className: "error-text", children: "This invite is invalid or expired." }) }) }));
    }
    return (_jsx("div", { className: "auth-page", children: _jsxs("div", { className: "card auth-card stack", children: [_jsxs("div", { children: [_jsx("h1", { children: "Workspace invite" }), _jsxs("p", { className: "muted", children: ["You were invited to join ", _jsx("strong", { children: inviteQuery.data.organization.name }), " as", " ", _jsx("strong", { children: inviteQuery.data.invite.role }), "."] })] }), _jsxs("div", { className: "card surface-muted", children: [_jsx("p", { className: "muted", children: "Invited email" }), _jsx("p", { children: inviteQuery.data.invite.email }), _jsxs("p", { className: "muted", children: ["Expires ", new Date(inviteQuery.data.invite.expiresAt).toLocaleString()] })] }), user ? (_jsx("button", { type: "button", onClick: () => void handleAcceptInvite(), disabled: acceptInviteMutation.isPending, children: acceptInviteMutation.isPending ? "Accepting..." : "Accept invite" })) : (_jsxs("div", { className: "stack", children: [_jsx(Link, { className: "button-link", to: `/register?invite=${encodeURIComponent(token)}`, children: "Create account and join" }), _jsx(Link, { className: "button-link secondary-link", to: `/login?invite=${encodeURIComponent(token)}`, children: "Log in to accept" })] }))] }) }));
}
