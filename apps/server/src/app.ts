import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"

import "./types/express.js"
import { corsOptions } from "./config/cors.js"
import { errorHandler } from "./middleware/error-handler.js"
import { notFoundHandler } from "./middleware/not-found.js"
import { authRouter } from "./routes/auth.routes.js"
import { orgRouter } from "./routes/org.routes.js"

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json({ limit: "50kb" }))

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" })
  })

  app.use("/api/auth", authRouter)
  app.use("/api", orgRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
