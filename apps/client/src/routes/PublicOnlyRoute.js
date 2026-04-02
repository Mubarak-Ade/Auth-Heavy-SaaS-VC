import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function PublicOnlyRoute() {
    const { isLoadingAuth, user } = useAuth();
    if (isLoadingAuth) {
        return _jsx("div", { className: "centered", children: "Loading..." });
    }
    if (user) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(Outlet, {});
}
