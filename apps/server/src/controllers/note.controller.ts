import type { Request, Response } from "express"

import { NoteModel } from "../models/note.model.js"
import { HttpError } from "../utils/http-error.js"

function canManageNote(req: Request, createdBy: string) {
  return req.membership?.role === "owner" || req.membership?.role === "admin" || req.user?.id === createdBy
}

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

export async function updateNoteController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const note = await NoteModel.findOne({
    _id: req.params.noteId,
    orgId: req.params.orgId
  })

  if (!note) {
    throw new HttpError(404, "Note not found")
  }

  if (!canManageNote(req, note.createdBy.toString())) {
    throw new HttpError(403, "Forbidden")
  }

  if (req.body.title !== undefined) note.title = req.body.title
  if (req.body.content !== undefined) note.content = req.body.content
  if (req.body.visibility !== undefined) note.visibility = req.body.visibility

  await note.save()

  return res.status(200).json({
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

export async function deleteNoteController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const note = await NoteModel.findOne({
    _id: req.params.noteId,
    orgId: req.params.orgId
  })

  if (!note) {
    throw new HttpError(404, "Note not found")
  }

  if (!canManageNote(req, note.createdBy.toString())) {
    throw new HttpError(403, "Forbidden")
  }

  await note.deleteOne()

  return res.status(200).json({ success: true })
}
