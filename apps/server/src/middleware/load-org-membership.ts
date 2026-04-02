import type { NextFunction, Request, Response } from "express"

import { OrgMemberModel } from "../models/org-member.model.js"

export function loadOrgMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> | Response {
  const orgId = typeof req.params.orgId === "string" ? req.params.orgId : undefined

  if (!req.user || !orgId) {
    return res.status(403).json({ error: "Not a member" })
  }

  return OrgMemberModel.findOne({
    userId: req.user.id,
    orgId
  })
    .exec()
    .then((membership) => {
      if (!membership) {
        return res.status(403).json({ error: "Not a member" })
      }

      req.membership = {
        orgId: membership.orgId.toString(),
        userId: membership.userId.toString(),
        role: membership.role
      }

      next()
    })
    .catch(next)
}
