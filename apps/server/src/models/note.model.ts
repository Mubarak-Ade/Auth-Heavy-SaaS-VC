import mongoose, { Schema, type InferSchemaType } from "mongoose"

const noteSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    visibility: {
      type: String,
      enum: ["private", "org", "public"],
      default: "private"
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true
  }
)

export type NoteDocument = InferSchemaType<typeof noteSchema> & { _id: mongoose.Types.ObjectId }

export const NoteModel = mongoose.models.Note || mongoose.model("Note", noteSchema)
