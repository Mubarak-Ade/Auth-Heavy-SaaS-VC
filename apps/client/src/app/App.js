import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ToastViewport } from "../components/ToastViewport";
import { queryClient } from "../lib/query-client";
import { AppRoutes } from "../routes/AppRoutes";
export function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(BrowserRouter, { children: [_jsx(AppRoutes, {}), _jsx(ToastViewport, {})] }) }));
}
