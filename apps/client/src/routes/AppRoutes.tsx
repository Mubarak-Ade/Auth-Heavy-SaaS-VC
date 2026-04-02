import { Route, Routes } from "react-router-dom"

import { AppShell } from "../components/AppShell"
import { DashboardPage } from "../pages/DashboardPage"
import { LoginPage } from "../pages/LoginPage"
import { MembersPage } from "../pages/MembersPage"
import { NotesPage } from "../pages/NotesPage"
import { SettingsPage } from "../pages/SettingsPage"
import { TasksPage } from "../pages/TasksPage"
import { ProtectedRoute } from "./ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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
