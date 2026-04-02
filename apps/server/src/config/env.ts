export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "development-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "development-refresh-secret",
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS ?? 7),
  emailFrom: process.env.EMAIL_FROM ?? "",
  emailProviderApiKey: process.env.EMAIL_PROVIDER_API_KEY ?? ""
}

export const isProduction = env.nodeEnv === "production"
