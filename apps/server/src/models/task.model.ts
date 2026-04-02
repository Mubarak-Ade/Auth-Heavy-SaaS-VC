import mongoose, { Schema, type InferSchemaType } from "mongoose"

const taskSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, default: null },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: true
  }
)

export type TaskDocument = InferSchemaType<typeof taskSchema> & { _id: mongoose.Types.ObjectId }

export const TaskModel = mongoose.models.Task || mongoose.model("Task", taskSchema)
