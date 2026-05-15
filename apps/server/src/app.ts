import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"

import "./types/express.js"
import { corsOptions } from "./config/cors.js"
import { env } from "./config/env.js"
import { isRedisAvailable, isRedisReady } from "./lib/redis.js"
import { errorHandler } from "./middleware/error-handler.js"
import { notFoundHandler } from "./middleware/not-found.js"
import { createApiRateLimiter } from "./middleware/rate-limit.js"
import { requestContext } from "./middleware/request-context.js"
import { requestLogger } from "./middleware/request-logger.js"
import { authRouter } from "./routes/auth.routes.js"
import { orgRouter } from "./routes/org.routes.js"

export function createApp() {
  const app = express()

  if (env.trustProxy) {
    app.set("trust proxy", 1)
  }

  app.disable("x-powered-by")
  app.use(requestContext)
  app.use(requestLogger)
  app.use(helmet())
  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json({ limit: "50kb" }))
  app.use("/api", createApiRateLimiter())

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      services: {
        mongodb: "connected",
        redis: isRedisAvailable() ? (isRedisReady() ? "connected" : "connecting") : "disabled"
      }
    })
  })

  app.use("/api/auth", authRouter)
  app.use("/api", orgRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
