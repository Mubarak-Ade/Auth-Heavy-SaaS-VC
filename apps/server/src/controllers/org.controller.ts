import type { Request, Response } from "express"

import { OrgMemberModel } from "../models/org-member.model.js"
import { OrganizationModel } from "../models/organization.model.js"
import { NoteModel } from "../models/note.model.js"
import { TaskModel } from "../models/task.model.js"
import { HttpError } from "../utils/http-error.js"
import { slugify } from "../utils/slug.js"

export async function listOrganizationsController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const memberships = await OrgMemberModel.find({ userId: req.user.id })
  const orgIds = memberships.map((membership) => membership.orgId)
  const organizations = await OrganizationModel.find({ _id: { $in: orgIds } })

  const items = organizations.map((organization) => {
    const membership = memberships.find(
      (entry) => entry.orgId.toString() === organization._id.toString()
    )

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: membership?.role ?? "viewer"
    }
  })

  return res.status(200).json({
    items
  })
}

export async function createOrganizationController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const requestedSlug = slugify(req.body.slug || req.body.name)

  if (await OrganizationModel.exists({ slug: requestedSlug })) {
    throw new HttpError(409, "An organization with that slug already exists")
  }

  const organization = await OrganizationModel.create({
    name: req.body.name,
    slug: requestedSlug,
    ownerId: req.user.id
  })

  await OrgMemberModel.create({
    userId: req.user.id,
    orgId: organization._id,
    role: "owner"
  })

  return res.status(201).json({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    plan: organization.plan
  })
}

export async function getOrganizationDashboardController(
  req: Request,
  res: Response
): Promise<Response> {
  const [totalTasks, openTasks, completedTasks, totalNotes] = await Promise.all([
    TaskModel.countDocuments({ orgId: req.params.orgId }),
    TaskModel.countDocuments({ orgId: req.params.orgId, status: { $ne: "done" } }),
    TaskModel.countDocuments({ orgId: req.params.orgId, status: "done" }),
    NoteModel.countDocuments({ orgId: req.params.orgId })
  ])

  return res.status(200).json({
    orgId: req.params.orgId,
    metrics: {
      totalTasks,
      openTasks,
      completedTasks,
      totalNotes
    }
  })
}
