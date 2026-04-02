import type { Request, Response } from "express"

import { TaskModel } from "../models/task.model.js"
import { HttpError } from "../utils/http-error.js"

export async function listTasksController(req: Request, res: Response): Promise<Response> {
  if (!req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const items = await TaskModel.find({ orgId: req.params.orgId }).sort({ createdAt: -1 })

  return res.status(200).json({
    orgId: req.params.orgId,
    items: items.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId?.toString() ?? null,
      createdBy: task.createdBy.toString(),
      dueDate: task.dueDate,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }))
  })
}

export async function createTaskController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const task = await TaskModel.create({
    orgId: req.params.orgId,
    title: req.body.title,
    description: req.body.description ?? "",
    status: req.body.status,
    priority: req.body.priority,
    assigneeId: req.body.assigneeId || null,
    createdBy: req.user.id,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
    tags: req.body.tags ?? []
  })

  return res.status(201).json({
    id: task.id,
    orgId: task.orgId.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId?.toString() ?? null,
    createdBy: task.createdBy.toString(),
    dueDate: task.dueDate,
    tags: task.tags,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  })
}
