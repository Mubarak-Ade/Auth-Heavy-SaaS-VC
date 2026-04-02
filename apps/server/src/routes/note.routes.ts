import { Router } from "express"

import { createNoteController, listNotesController } from "../controllers/note.controller.js"
import { requireRole } from "../middleware/require-role.js"
import { validate } from "../middleware/validate.js"
import { createNoteSchema } from "../schemas/note.schemas.js"
import { asyncHandler } from "../utils/async-handler.js"

export const noteRouter = Router({ mergeParams: true })

noteRouter.get("/", asyncHandler(listNotesController))
noteRouter.post(
  "/",
  requireRole("owner", "admin", "member"),
  validate(createNoteSchema),
  asyncHandler(createNoteController)
)
