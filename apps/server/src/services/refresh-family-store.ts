import { getRedisClient, isRedisAvailable } from "../lib/redis.js"

const REFRESH_FAMILY_PREFIX = "auth:refresh-family-revoked:"

function getRefreshFamilyKey(family: string): string {
  return `${REFRESH_FAMILY_PREFIX}${family}`
}

function getTtlSeconds(expiresAt: Date): number {
  const ttlMs = expiresAt.getTime() - Date.now()
  return Math.max(1, Math.ceil(ttlMs / 1000))
}

export async function isRefreshFamilyRevoked(family: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false
  }

  const value = await getRedisClient().get(getRefreshFamilyKey(family))
  return value === "1"
}

export async function revokeRefreshFamily(family: string, expiresAt: Date): Promise<void> {
  if (!isRedisAvailable() || expiresAt <= new Date()) {
    return
  }

  await getRedisClient().set(getRefreshFamilyKey(family), "1", {
    EX: getTtlSeconds(expiresAt)
  })
}

export async function revokeRefreshFamilies(
  sessions: Array<{ family: string; expiresAt: Date }>
): Promise<void> {
  await Promise.all(sessions.map((session) => revokeRefreshFamily(session.family, session.expiresAt)))
}
