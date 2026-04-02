import { Route, Routes } from "react-router-dom"

import { AppShell } from "../components/AppShell"
import { DashboardPage } from "../pages/DashboardPage"
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage"
import { InvitePage } from "../pages/InvitePage"
import { LoginPage } from "../pages/LoginPage"
import { MembersPage } from "../pages/MembersPage"
import { NotesPage } from "../pages/NotesPage"
import { RegisterPage } from "../pages/RegisterPage"
import { ResetPasswordPage } from "../pages/ResetPasswordPage"
import { SettingsPage } from "../pages/SettingsPage"
import { TasksPage } from "../pages/TasksPage"
import { PublicOnlyRoute } from "./PublicOnlyRoute"
import { ProtectedRoute } from "./ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/invite" element={<InvitePage />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/tasks"
          element={
            <AppShell>
              <TasksPage />
            </AppShell>
          }
        />
        <Route
          path="/notes"
          element={
            <AppShell>
              <NotesPage />
            </AppShell>
          }
        />
        <Route
          path="/members"
          element={
            <AppShell>
              <MembersPage />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell>
              <SettingsPage />
            </AppShell>
          }
        />
      </Route>
    </Routes>
  )
}
