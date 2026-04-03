import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMemberMutations, useMembersQuery } from "../hooks/useWorkspace";
import { useUiStore } from "../store/ui-store";
export function MembersPage() {
    const pushToast = useUiStore((state) => state.pushToast);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [lastInviteToken, setLastInviteToken] = useState(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
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
        pushToast({ title: "Invite created", tone: "success" });
    }
    const filteredMembers = [...(membersQuery.data ?? [])]
        .filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
            member.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" ? true : member.role === roleFilter;
        return matchesSearch && matchesRole;
    })
        .sort((left, right) => {
        if (sortBy === "role") {
            const rank = { owner: 3, admin: 2, member: 1, viewer: 0 };
            return rank[right.role] - rank[left.role];
        }
        return left.name.localeCompare(right.name);
    });
    return (_jsxs("section", { className: "stack", children: [_jsxs("div", { children: [_jsx("h2", { children: "Members" }), _jsx("p", { className: "muted", children: "Invite teammates, review access, and manage roles." })] }), _jsxs("div", { className: "card filters-grid", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Search" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search members" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Role" }), _jsxs("select", { value: roleFilter, onChange: (event) => setRoleFilter(event.target.value), children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "viewer", children: "Viewer" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Sort" }), _jsxs("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), children: [_jsx("option", { value: "name", children: "Name" }), _jsx("option", { value: "role", children: "Role" })] })] })] }), canManageMembers ? (_jsxs("form", { className: "card stack", onSubmit: handleInvite, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), type: "email" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Role" }), _jsxs("select", { value: role, onChange: (event) => setRole(event.target.value), children: [_jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "viewer", children: "Viewer" })] })] }), _jsx("button", { type: "submit", disabled: inviteMemberMutation.isPending, children: inviteMemberMutation.isPending ? "Inviting..." : "Send invite" }), lastInviteToken ? (_jsxs("p", { className: "muted", children: ["Latest invite token for testing: ", _jsx("code", { children: lastInviteToken })] })) : null] })) : null, membersQuery.isLoading ? _jsx("div", { className: "card", children: "Loading members..." }) : null, membersQuery.isError ? _jsx("div", { className: "card error-text", children: "Could not load members right now." }) : null, _jsxs("div", { className: "stack", children: [filteredMembers.map((member) => (_jsxs("article", { className: "card stack", children: [_jsxs("div", { children: [_jsx("h3", { children: member.name }), _jsx("p", { className: "muted", children: member.email })] }), _jsxs("p", { children: ["Role: ", _jsx("strong", { children: member.role })] }), canManageMembers ? (_jsxs("div", { className: "row", children: [_jsxs("select", { value: member.role, onChange: (event) => void updateMemberRoleMutation
                                            .mutateAsync({
                                            memberId: member.id,
                                            role: event.target.value
                                        })
                                            .then(() => pushToast({ title: "Member role updated", tone: "success" })), children: [_jsx("option", { value: "owner", children: "Owner" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "viewer", children: "Viewer" })] }), _jsx("button", { type: "button", onClick: () => void removeMemberMutation
                                            .mutateAsync(member.id)
                                            .then(() => pushToast({ title: "Member removed", tone: "info" })), children: "Remove" })] })) : null] }, member.id))), !filteredMembers.length && !membersQuery.isLoading ? _jsx("div", { className: "card", children: "No members match your filters." }) : null] })] }));
}
