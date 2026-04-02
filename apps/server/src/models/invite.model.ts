import mongoose, { Schema, type InferSchemaType } from "mongoose"

const inviteSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      required: true
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

inviteSchema.index({ tokenHash: 1 }, { unique: true })

export type InviteDocument = InferSchemaType<typeof inviteSchema> & { _id: mongoose.Types.ObjectId }

export const InviteModel = mongoose.models.Invite || mongoose.model("Invite", inviteSchema)
