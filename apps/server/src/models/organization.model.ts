import mongoose, { Schema, type InferSchemaType } from "mongoose"

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true
  }
)

organizationSchema.index({ slug: 1 }, { unique: true })

export type OrganizationDocument = InferSchemaType<typeof organizationSchema> & {
  _id: mongoose.Types.ObjectId
}

export const OrganizationModel =
  mongoose.models.Organization || mongoose.model("Organization", organizationSchema)
