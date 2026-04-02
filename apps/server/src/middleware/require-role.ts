import type { NextFunction, Request, Response } from "express"

import type { OrgRole } from "@auth-heavy-saas/shared"

export function requireRole(...roles: OrgRole[]) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.membership || !roles.includes(req.membership.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}
