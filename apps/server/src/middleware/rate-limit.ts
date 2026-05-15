import rateLimit from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"

import { env } from "../config/env.js"
import { getRedisClient, isRedisAvailable } from "../lib/redis.js"

function createRedisStore() {
  if (!isRedisAvailable()) {
    return undefined
  }

  return new RedisStore({
    prefix: "rate-limit:",
    sendCommand: (...args: string[]) => getRedisClient().sendCommand(args)
  })
}

export function createApiRateLimiter() {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    store: createRedisStore(),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests, please try again later."
    }
  })
}
