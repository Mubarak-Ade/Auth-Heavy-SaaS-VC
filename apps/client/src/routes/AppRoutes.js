import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { InvitePage } from "../pages/InvitePage";
import { LoginPage } from "../pages/LoginPage";
import { MembersPage } from "../pages/MembersPage";
import { NotesPage } from "../pages/NotesPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TasksPage } from "../pages/TasksPage";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { ProtectedRoute } from "./ProtectedRoute";
export function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/invite", element: _jsx(InvitePage, {}) }), _jsxs(Route, { element: _jsx(PublicOnlyRoute, {}), children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { path: "/", element: _jsx(AppShell, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/tasks", element: _jsx(AppShell, { children: _jsx(TasksPage, {}) }) }), _jsx(Route, { path: "/notes", element: _jsx(AppShell, { children: _jsx(NotesPage, {}) }) }), _jsx(Route, { path: "/members", element: _jsx(AppShell, { children: _jsx(MembersPage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(AppShell, { children: _jsx(SettingsPage, {}) }) })] })] }));
}
