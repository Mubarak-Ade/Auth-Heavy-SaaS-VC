import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function ProtectedRoute() {
    const { isLoadingAuth, user } = useAuth();
    const location = useLocation();
    if (isLoadingAuth) {
        return _jsx("div", { className: "centered", children: "Loading workspace..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return _jsx(Outlet, {});
}
