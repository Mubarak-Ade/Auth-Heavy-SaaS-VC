import path from "node:path"
import { fileURLToPath } from "node:url"

import dotenv from "dotenv"
import { bool, cleanEnv, num, str } from "envalid"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, "../../.env")

dotenv.config({ path: envPath })

const validatedEnv = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development"
  }),
  PORT: num({ default: 5000 }),
  MONGODB_URI: str(),
  REDIS_URL: str({ default: "redis://localhost:6379" }),
  APP_ORIGIN: str({ default: "http://localhost:5173" }),
  TRUST_PROXY: bool({ default: false }),
  JWT_ACCESS_SECRET: str(),
  JWT_ACCESS_EXPIRES_IN: str({ default: "15m" }),
  JWT_REFRESH_SECRET: str(),
  REFRESH_TOKEN_DAYS: num({ default: 7 }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }),
  RATE_LIMIT_MAX: num({ default: 100 }),
  EMAIL_FROM: str({ default: "noreply@example.com" }),
  EMAIL_PROVIDER_API_KEY: str({ default: "development-email-key" })
})

export const env = {
  nodeEnv: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  mongoUri: validatedEnv.MONGODB_URI,
  redisUrl: validatedEnv.REDIS_URL,
  appOrigin: validatedEnv.APP_ORIGIN,
  trustProxy: validatedEnv.TRUST_PROXY,
  jwtAccessSecret: validatedEnv.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: validatedEnv.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: validatedEnv.JWT_REFRESH_SECRET,
  refreshTokenDays: validatedEnv.REFRESH_TOKEN_DAYS,
  rateLimitWindowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: validatedEnv.RATE_LIMIT_MAX,
  emailFrom: validatedEnv.EMAIL_FROM,
  emailProviderApiKey: validatedEnv.EMAIL_PROVIDER_API_KEY
} as const

export const isProduction = env.nodeEnv === "production"
