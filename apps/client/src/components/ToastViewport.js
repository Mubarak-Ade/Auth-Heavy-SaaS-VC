import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { useUiStore } from "../store/ui-store";
export function ToastViewport() {
    const toasts = useUiStore((state) => state.toasts);
    const removeToast = useUiStore((state) => state.removeToast);
    useEffect(() => {
        if (!toasts.length)
            return;
        const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 3000));
        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [removeToast, toasts]);
    return (_jsx("div", { className: "toast-viewport", children: toasts.map((toast) => (_jsx("div", { className: `toast toast-${toast.tone}`, children: toast.title }, toast.id))) }));
}
