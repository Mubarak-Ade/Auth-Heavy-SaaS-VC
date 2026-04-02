import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMemberMutations, useMembersQuery } from "../hooks/useWorkspace";
export function MembersPage() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [lastInviteToken, setLastInviteToken] = useState(null);
    const { currentRole } = useAuth();
    const membersQuery = useMembersQuery();
    const { inviteMemberMutation, updateMemberRoleMutation, removeMemberMutation } = useMemberMutations();
    const canManageMembers = currentRole === "owner" || currentRole === "admin";
    async function handleInvite(event) {
        event.preventDefault();
        const result = await inviteMemberMutation.mutateAsync({ email, role });
        setLastInviteToken(result.inviteToken);
        setEmail("");
        setRole("member");
    }
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Members" }), _jsx("p", { className: "muted", children: "Invite teammates, review access, and manage roles." })] }), canManageMembers ? (_jsxs("form", { className: "card stack", onSubmit: handleInvite, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), type: "email" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Role" }), _jsxs("select", { value: role, onChange: (event) => setRole(event.target.value), children: [_jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "viewer", children: "Viewer" })] })] }), _jsx("button", { type: "submit", disabled: inviteMemberMutation.isPending, children: inviteMemberMutation.isPending ? "Inviting..." : "Send invite" }), lastInviteToken ? (_jsxs("p", { className: "muted", children: ["Latest invite token for testing: ", _jsx("code", { children: lastInviteToken })] })) : null] })) : null, _jsxs("div", { className: "stack", children: [membersQuery.data?.map((member) => (_jsxs("article", { className: "card stack", children: [_jsxs("div", { children: [_jsx("h3", { children: member.name }), _jsx("p", { className: "muted", children: member.email })] }), _jsxs("p", { children: ["Role: ", _jsx("strong", { children: member.role })] }), canManageMembers ? (_jsxs("div", { className: "row", children: [_jsxs("select", { value: member.role, onChange: (event) => void updateMemberRoleMutation.mutateAsync({
                                            memberId: member.id,
                                            role: event.target.value
                                        }), children: [_jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "viewer", children: "Viewer" })] }), _jsx("button", { type: "button", onClick: () => void removeMemberMutation.mutateAsync(member.id), children: "Remove" })] })) : null] }, member.id))), !membersQuery.data?.length ? _jsx("div", { className: "card", children: "No members found." }) : null] })] }));
}
