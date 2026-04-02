import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

export const api = axios.create({
  baseURL,
  withCredentials: true
})

let accessToken: string | null = null
let isRefreshing = false
let queue: Array<(token: string) => void> = []

export function setAccessToken(token: string | null) {
  accessToken = token
}

api.interceptors.request.use((config) => {
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
      setAccessToken(response.data.accessToken)

      queue.forEach((resume) => resume(response.data.accessToken))
      queue = []

      original.headers.Authorization = `Bearer ${response.data.accessToken}`
      return api(original)
    } finally {
      isRefreshing = false
    }
  }
)
