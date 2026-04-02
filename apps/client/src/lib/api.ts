import axios from "axios"

import { queryClient } from "./query-client"
import { useAuthStore } from "../store/auth-store"

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

export const api = axios.create({
  baseURL,
  withCredentials: true
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

export function setAccessToken(token: string | null) {
  const user = useAuthStore.getState().user

  if (token && user) {
    useAuthStore.getState().setSession({ user, accessToken: token })
    return
  }

  if (!token) {
    useAuthStore.getState().clearSession()
  }
}

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true

    try {
      const response = await api.post("/auth/refresh")
      useAuthStore.getState().setSession({
        user: response.data.user,
        accessToken: response.data.accessToken
      })
      useAuthStore.getState().setInitialized(true)
      void queryClient.invalidateQueries({ queryKey: ["organizations"] })

      queue.forEach((resume) => resume(response.data.accessToken))
      queue = []

      original.headers.Authorization = `Bearer ${response.data.accessToken}`
      return api(original)
    } catch (refreshError) {
      useAuthStore.getState().clearSession()
      useAuthStore.getState().setInitialized(true)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
