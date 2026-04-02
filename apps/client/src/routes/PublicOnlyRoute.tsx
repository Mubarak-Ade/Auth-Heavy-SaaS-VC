import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

export function PublicOnlyRoute() {
  const { isLoadingAuth, user } = useAuth()

  if (isLoadingAuth) {
    return <div className="centered">Loading...</div>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
