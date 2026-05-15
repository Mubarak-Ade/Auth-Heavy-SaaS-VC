import { createClient } from "redis"

import { env } from "../config/env.js"

type AppRedisClient = ReturnType<typeof createClient>

let redisClient: AppRedisClient | null = null
let redisAvailable = env.redisEnabled

function createRedisClient(): AppRedisClient {
  const client = createClient({
    url: env.redisUrl,
    socket: {
      reconnectStrategy: false
    }
  })

  client.on("error", (error) => {
    console.error("Redis client error", error)
  })

  return client
}

export function getRedisClient(): AppRedisClient {
  if (!redisAvailable) {
    throw new Error("Redis is disabled for this environment")
  }

  redisClient ??= createRedisClient()

  return redisClient
}

export async function connectToRedis(): Promise<void> {
  if (!redisAvailable) {
    return
  }

  const client = getRedisClient()

  if (client.isOpen) {
    return
  }

  try {
    await client.connect()
  } catch (error) {
    redisAvailable = false
    if (redisClient?.isOpen) {
      redisClient.destroy()
    }
    redisClient = null
    console.warn("Redis unavailable; continuing without Redis-backed rate limiting and refresh revocation.", error)
  }
}

export function isRedisAvailable(): boolean {
  return redisAvailable
}

export function isRedisReady(): boolean {
  return redisAvailable && Boolean(redisClient?.isReady)
}
