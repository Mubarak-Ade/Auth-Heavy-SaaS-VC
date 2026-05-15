import { beforeEach, describe, expect, it, vi } from "vitest"
import crypto from "node:crypto"

const userModelMocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn(),
  create: vi.fn()
}))

const refreshFamilyStoreMocks = vi.hoisted(() => ({
  isRefreshFamilyRevoked: vi.fn(),
  revokeRefreshFamily: vi.fn(),
  revokeRefreshFamilies: vi.fn()
}))

const tokenServiceMocks = vi.hoisted(() => ({
  issueTokenPair: vi.fn(),
  parseRefreshToken: vi.fn(),
  signAccessToken: vi.fn()
}))

vi.mock("../models/user.model.js", () => ({
  UserModel: userModelMocks
}))

vi.mock("../models/invite.model.js", () => ({
  InviteModel: {
    findOne: vi.fn()
  }
}))

vi.mock("../models/org-member.model.js", () => ({
  OrgMemberModel: {
    create: vi.fn()
  }
}))

vi.mock("../models/organization.model.js", () => ({
  OrganizationModel: {
    exists: vi.fn(),
    create: vi.fn()
  }
}))

vi.mock("./refresh-family-store.js", () => refreshFamilyStoreMocks)
vi.mock("./token.service.js", () => tokenServiceMocks)

describe("auth service", () => {
  beforeEach(() => {
    vi.resetModules()
    Object.values(userModelMocks).forEach((mockFn) => mockFn.mockReset())
    Object.values(refreshFamilyStoreMocks).forEach((mockFn) => mockFn.mockReset())
    Object.values(tokenServiceMocks).forEach((mockFn) => mockFn.mockReset())
  })

  it("rejects refresh when the token family is revoked in Redis", async () => {
    tokenServiceMocks.parseRefreshToken.mockReturnValue({
      family: "family-1",
      secret: "secret"
    })
    refreshFamilyStoreMocks.isRefreshFamilyRevoked.mockResolvedValue(true)

    const { refreshUserSession } = await import("./auth.service.js")

    await expect(refreshUserSession("family-1.secret")).rejects.toMatchObject({
      statusCode: 401,
      message: "Refresh token revoked"
    })

    expect(refreshFamilyStoreMocks.isRefreshFamilyRevoked).toHaveBeenCalledWith("family-1")
    expect(userModelMocks.findOne).not.toHaveBeenCalled()
  })

  it("revokes the refresh family in Redis on logout", async () => {
    const expiresAt = new Date(Date.now() + 60_000)
    const rawToken = "family-1.secret"
    const user = {
      refreshTokens: [
        {
          tokenHash: crypto.createHash("sha256").update(rawToken).digest("hex"),
          family: "family-1",
          expiresAt
        }
      ],
      save: vi.fn().mockResolvedValue(undefined)
    }

    userModelMocks.findOne.mockResolvedValue(user)

    const { logoutUser } = await import("./auth.service.js")

    await logoutUser(rawToken)

    expect(user.refreshTokens).toEqual([])
    expect(user.save).toHaveBeenCalledTimes(1)
    expect(refreshFamilyStoreMocks.revokeRefreshFamily).toHaveBeenCalledWith("family-1", expiresAt)
  })
})
