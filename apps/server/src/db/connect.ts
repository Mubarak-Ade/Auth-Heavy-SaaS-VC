import mongoose from "mongoose"

import { env } from "../config/env.js"

let isConnected = false

export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    return
  }

  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not configured")
  }

  await mongoose.connect(env.mongoUri)
  isConnected = true
}
