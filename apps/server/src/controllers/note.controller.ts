import type { Request, Response } from "express"

import { NoteModel } from "../models/note.model.js"
import { HttpError } from "../utils/http-error.js"

export async function listNotesController(req: Request, res: Response): Promise<Response> {
  if (!req.membership || !req.user) {
    throw new HttpError(403, "Not a member")
  }

  const visibilityFilter =
    req.membership.role === "owner" || req.membership.role === "admin"
      ? { orgId: req.params.orgId }
      : {
          orgId: req.params.orgId,
          $or: [{ visibility: { $in: ["org", "public"] } }, { createdBy: req.user.id }]
        }

  const items = await NoteModel.find(visibilityFilter).sort({ updatedAt: -1 })

  return res.status(200).json({
    orgId: req.params.orgId,
    items: items.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      visibility: note.visibility,
      createdBy: note.createdBy.toString(),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }))
  })
}

export async function createNoteController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const note = await NoteModel.create({
    orgId: req.params.orgId,
    title: req.body.title,
    content: req.body.content,
    visibility: req.body.visibility,
    createdBy: req.user.id
  })

  return res.status(201).json({
    id: note.id,
    orgId: note.orgId.toString(),
    title: note.title,
    content: note.content,
    visibility: note.visibility,
    createdBy: note.createdBy.toString(),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  })
}
