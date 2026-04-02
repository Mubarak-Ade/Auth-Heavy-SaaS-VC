import type { Request, Response } from "express"

import { TaskModel } from "../models/task.model.js"
import { HttpError } from "../utils/http-error.js"

function canManageTask(req: Request, createdBy: string) {
  return req.membership?.role === "owner" || req.membership?.role === "admin" || req.user?.id === createdBy
}

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

export async function updateTaskController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const task = await TaskModel.findOne({
    _id: req.params.taskId,
    orgId: req.params.orgId
  })

  if (!task) {
    throw new HttpError(404, "Task not found")
  }

  if (!canManageTask(req, task.createdBy.toString())) {
    throw new HttpError(403, "Forbidden")
  }

  if (req.body.title !== undefined) task.title = req.body.title
  if (req.body.description !== undefined) task.description = req.body.description
  if (req.body.status !== undefined) task.status = req.body.status
  if (req.body.priority !== undefined) task.priority = req.body.priority
  if (req.body.assigneeId !== undefined) task.assigneeId = req.body.assigneeId || null
  if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null
  if (req.body.tags !== undefined) task.tags = req.body.tags

  await task.save()

  return res.status(200).json({
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

export async function deleteTaskController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(403, "Not a member")
  }

  const task = await TaskModel.findOne({
    _id: req.params.taskId,
    orgId: req.params.orgId
  })

  if (!task) {
    throw new HttpError(404, "Task not found")
  }

  if (!canManageTask(req, task.createdBy.toString())) {
    throw new HttpError(403, "Forbidden")
  }

  await task.deleteOne()

  return res.status(200).json({ success: true })
}
