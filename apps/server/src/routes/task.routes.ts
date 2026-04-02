import { Router } from "express"

import { createTaskController, listTasksController } from "../controllers/task.controller.js"
import { requireRole } from "../middleware/require-role.js"
import { validate } from "../middleware/validate.js"
import { createTaskSchema } from "../schemas/task.schemas.js"
import { asyncHandler } from "../utils/async-handler.js"

export const taskRouter = Router({ mergeParams: true })

taskRouter.get("/", asyncHandler(listTasksController))
taskRouter.post(
  "/",
  requireRole("owner", "admin", "member"),
  validate(createTaskSchema),
  asyncHandler(createTaskController)
)
