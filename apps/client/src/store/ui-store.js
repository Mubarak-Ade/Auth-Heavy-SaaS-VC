import { create } from "zustand";
import { randomUUID } from "../utils/id";
export const useUiStore = create((set) => ({
    toasts: [],
    pushToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: randomUUID() }]
    })),
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}));
