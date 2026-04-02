import { Router } from "express"

import {
  forgotPasswordController,
  loginController,
  listSessionsController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resetPasswordController,
  revokeAllSessionsController,
  revokeSessionController
} from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/authenticate.js"
import { validate } from "../middleware/validate.js"
import { asyncHandler } from "../utils/async-handler.js"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionParamsSchema
} from "../schemas/auth.schemas.js"

export const authRouter = Router()

authRouter.post("/register", validate(registerSchema), asyncHandler(registerController))
authRouter.post("/login", validate(loginSchema), asyncHandler(loginController))
authRouter.post("/refresh", asyncHandler(refreshController))
authRouter.post("/logout", asyncHandler(logoutController))
authRouter.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPasswordController))
authRouter.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPasswordController))
authRouter.get("/me", authenticate, asyncHandler(meController))
authRouter.get("/sessions", authenticate, asyncHandler(listSessionsController))
authRouter.delete(
  "/sessions/:sessionId",
  authenticate,
  validate(sessionParamsSchema),
  asyncHandler(revokeSessionController)
)
authRouter.delete("/sessions", authenticate, asyncHandler(revokeAllSessionsController))
