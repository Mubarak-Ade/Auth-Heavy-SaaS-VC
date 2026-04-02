import { createApp } from "./app.js"
import { env } from "./config/env.js"
import { connectToDatabase } from "./db/connect.js"

async function bootstrap() {
  await connectToDatabase()

  const app = createApp()

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap API", error)
  process.exit(1)
})
