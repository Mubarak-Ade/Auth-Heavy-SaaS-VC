import { Router } from "express"

import {
  createTaskController,
  deleteTaskController,
  listTasksController,
  updateTaskController
} from "../controllers/task.controller.js"
import { requireRole } from "../middleware/require-role.js"
import { validate } from "../middleware/validate.js"
import { createTaskSchema, taskParamsSchema, updateTaskSchema } from "../schemas/task.schemas.js"
import { asyncHandler } from "../utils/async-handler.js"

export const taskRouter = Router({ mergeParams: true })

taskRouter.get("/", asyncHandler(listTasksController))
taskRouter.post(
  "/",
  requireRole("owner", "admin", "member"),
  validate(createTaskSchema),
  asyncHandler(createTaskController)
)
taskRouter.patch(
  "/:taskId",
  requireRole("owner", "admin", "member"),
  validate(updateTaskSchema),
  asyncHandler(updateTaskController)
)
taskRouter.delete(
  "/:taskId",
  requireRole("owner", "admin", "member"),
  validate(taskParamsSchema),
  asyncHandler(deleteTaskController)
)
