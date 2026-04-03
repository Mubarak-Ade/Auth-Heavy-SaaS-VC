import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

const authServiceMocks = vi.hoisted(() => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  refreshUserSession: vi.fn(),
  getCurrentUser: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  listUserSessions: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllSessions: vi.fn()
}))

vi.mock("../services/auth.service.js", () => authServiceMocks)

describe("auth routes", () => {
  beforeEach(() => {
    vi.resetModules()
    Object.values(authServiceMocks).forEach((mockFn) => mockFn.mockReset())
  })

  it("registers a user and sets a refresh cookie", async () => {
    authServiceMocks.registerUser.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
      accessToken: "access-token",
      refreshToken: "refresh-token"
    })

    const { createApp } = await import("../app.js")
    const app = createApp()

    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123"
    })

    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe("test@example.com")
    expect(response.headers["set-cookie"]).toBeTruthy()
  })

  it("logs in a user and returns an access token", async () => {
    authServiceMocks.loginUser.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
      accessToken: "access-token",
      refreshToken: "refresh-token"
    })

    const { createApp } = await import("../app.js")
    const app = createApp()

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password123"
    })

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toBe("access-token")
  })

  it("returns 401 for /me without an access token", async () => {
    const { createApp } = await import("../app.js")
    const app = createApp()

    const response = await request(app).get("/api/auth/me")

    expect(response.status).toBe(401)
    expect(response.body.error).toBe("Unauthorized")
  })

  it("returns 401 for refresh without a refresh cookie", async () => {
    const { createApp } = await import("../app.js")
    const app = createApp()

    const response = await request(app).post("/api/auth/refresh")

    expect(response.status).toBe(401)
    expect(response.body.error).toBe("Refresh token is missing")
  })
})
