import mongoose, { Schema, type InferSchemaType } from "mongoose"

const sessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    family: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    lastUsedAt: { type: Date },
    userAgent: { type: String },
    ip: { type: String }
  },
  { _id: true }
)

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    refreshTokens: { type: [sessionSchema], default: [] }
  },
  {
    timestamps: true
  }
)

userSchema.index({ "refreshTokens.tokenHash": 1 })
userSchema.index({ resetToken: 1 })

export type SessionSubdocument = InferSchemaType<typeof sessionSchema>
export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId }

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)
