import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"

import { ToastViewport } from "../components/ToastViewport"
import { queryClient } from "../lib/query-client"
import { AppRoutes } from "../routes/AppRoutes"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <ToastViewport />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
