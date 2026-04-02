import { Router } from "express"

import {
  createOrganizationController,
  getOrganizationDashboardController,
  listOrganizationsController
} from "../controllers/org.controller.js"
import {
  acceptInviteController,
  getInviteDetailsController,
  inviteMemberController,
  listMembersController,
  removeMemberController,
  updateMemberRoleController
} from "../controllers/member.controller.js"
import { authenticate } from "../middleware/authenticate.js"
import { loadOrgMembership } from "../middleware/load-org-membership.js"
import { requireRole } from "../middleware/require-role.js"
import { validate } from "../middleware/validate.js"
import {
  acceptInviteSchema,
  createOrgSchema,
  inviteMemberSchema,
  inviteTokenParamsSchema,
  memberParamsSchema,
  updateMemberRoleSchema
} from "../schemas/org.schemas.js"
import { asyncHandler } from "../utils/async-handler.js"
import { noteRouter } from "./note.routes.js"
import { taskRouter } from "./task.routes.js"

export const orgRouter = Router()

orgRouter.get(
  "/orgs/invites/:token",
  validate(inviteTokenParamsSchema),
  asyncHandler(getInviteDetailsController)
)
orgRouter.post("/orgs/invites/accept", authenticate, validate(acceptInviteSchema), asyncHandler(acceptInviteController))
orgRouter.use(authenticate)
orgRouter.get("/orgs", asyncHandler(listOrganizationsController))
orgRouter.post("/orgs", validate(createOrgSchema), asyncHandler(createOrganizationController))
orgRouter.get("/orgs/:orgId/dashboard", loadOrgMembership, asyncHandler(getOrganizationDashboardController))
orgRouter.get("/orgs/:orgId/members", loadOrgMembership, asyncHandler(listMembersController))
orgRouter.post(
  "/orgs/:orgId/invites",
  loadOrgMembership,
  requireRole("owner", "admin"),
  validate(inviteMemberSchema),
  asyncHandler(inviteMemberController)
)
orgRouter.patch(
  "/orgs/:orgId/members/:memberId/role",
  loadOrgMembership,
  requireRole("owner", "admin"),
  validate(updateMemberRoleSchema),
  asyncHandler(updateMemberRoleController)
)
orgRouter.delete(
  "/orgs/:orgId/members/:memberId",
  loadOrgMembership,
  requireRole("owner", "admin"),
  validate(memberParamsSchema),
  asyncHandler(removeMemberController)
)
orgRouter.use("/orgs/:orgId/tasks", loadOrgMembership, taskRouter)
orgRouter.use("/orgs/:orgId/notes", loadOrgMembership, noteRouter)
