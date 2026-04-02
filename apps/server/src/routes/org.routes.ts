import { Router } from "express"

import {
  createOrganizationController,
  getOrganizationDashboardController,
  listOrganizationsController
} from "../controllers/org.controller.js"
import { authenticate } from "../middleware/authenticate.js"
import { loadOrgMembership } from "../middleware/load-org-membership.js"
import { validate } from "../middleware/validate.js"
import { createOrgSchema } from "../schemas/org.schemas.js"
import { asyncHandler } from "../utils/async-handler.js"
import { noteRouter } from "./note.routes.js"
import { taskRouter } from "./task.routes.js"

export const orgRouter = Router()

orgRouter.use(authenticate)
orgRouter.get("/orgs", asyncHandler(listOrganizationsController))
orgRouter.post("/orgs", validate(createOrgSchema), asyncHandler(createOrganizationController))
orgRouter.get("/orgs/:orgId/dashboard", loadOrgMembership, asyncHandler(getOrganizationDashboardController))
orgRouter.use("/orgs/:orgId/tasks", loadOrgMembership, taskRouter)
orgRouter.use("/orgs/:orgId/notes", loadOrgMembership, noteRouter)
