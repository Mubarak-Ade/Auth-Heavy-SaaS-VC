import { useEffect } from "react"

import { useUiStore } from "../store/ui-store"

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts)
  const removeToast = useUiStore((state) => state.removeToast)

  useEffect(() => {
    if (!toasts.length) return

    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), 3000)
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [removeToast, toasts])

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          {toast.title}
        </div>
      ))}
    </div>
  )
}
