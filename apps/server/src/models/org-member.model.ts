import mongoose, { Schema, type InferSchemaType } from "mongoose"

const orgMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      required: true
    },
    joinedAt: { type: Date, default: Date.now },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  {
    timestamps: false
  }
)

orgMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true })

export type OrgMemberDocument = InferSchemaType<typeof orgMemberSchema> & {
  _id: mongoose.Types.ObjectId
}

export const OrgMemberModel = mongoose.models.OrgMember || mongoose.model("OrgMember", orgMemberSchema)
