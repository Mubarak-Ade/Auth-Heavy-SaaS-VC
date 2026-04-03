import { create } from "zustand"

import { randomUUID } from "../utils/id"

export interface Toast {
  id: string
  title: string
  tone: "success" | "error" | "info"
}

interface UiStore {
  toasts: Toast[]
  pushToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: randomUUID() }]
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}))
