import { Router } from "express"

import {
  createNoteController,
  deleteNoteController,
  listNotesController,
  updateNoteController
} from "../controllers/note.controller.js"
import { requireRole } from "../middleware/require-role.js"
import { validate } from "../middleware/validate.js"
import { createNoteSchema, noteParamsSchema, updateNoteSchema } from "../schemas/note.schemas.js"
import { asyncHandler } from "../utils/async-handler.js"

export const noteRouter = Router({ mergeParams: true })

noteRouter.get("/", asyncHandler(listNotesController))
noteRouter.post(
  "/",
  requireRole("owner", "admin", "member"),
  validate(createNoteSchema),
  asyncHandler(createNoteController)
)
noteRouter.patch(
  "/:noteId",
  requireRole("owner", "admin", "member"),
  validate(updateNoteSchema),
  asyncHandler(updateNoteController)
)
noteRouter.delete(
  "/:noteId",
  requireRole("owner", "admin", "member"),
  validate(noteParamsSchema),
  asyncHandler(deleteNoteController)
)
