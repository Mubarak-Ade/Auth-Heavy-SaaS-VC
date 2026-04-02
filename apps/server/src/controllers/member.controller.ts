import type { Request, Response } from "express"

import { InviteModel } from "../models/invite.model.js"
import { OrgMemberModel } from "../models/org-member.model.js"
import { UserModel } from "../models/user.model.js"
import { normalizeEmail } from "../utils/identity.js"
import { HttpError } from "../utils/http-error.js"
import { randomToken, sha256 } from "../utils/crypto.js"

export async function listMembersController(req: Request, res: Response): Promise<Response> {
  const members = await OrgMemberModel.find({ orgId: req.params.orgId })
    .populate("userId", "name email")
    .sort({ joinedAt: 1 })

  return res.status(200).json({
    items: members.map((member) => {
      const user = member.userId as { _id?: string; name?: string; email?: string }

      return {
        id: member.id,
        userId: typeof user._id === "string" ? user._id : member.userId.toString(),
        name: user.name ?? "Unknown User",
        email: user.email ?? "",
        role: member.role,
        joinedAt: member.joinedAt
      }
    })
  })
}

export async function inviteMemberController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const email = normalizeEmail(req.body.email)
  const existingMemberUser = await UserModel.findOne({ email }).select("_id")

  if (existingMemberUser) {
    const existingMembership = await OrgMemberModel.exists({
      orgId: req.params.orgId,
      userId: existingMemberUser._id
    })

    if (existingMembership) {
      throw new HttpError(409, "User is already a member of this organization")
    }
  }

  await InviteModel.deleteMany({
    orgId: req.params.orgId,
    email,
    acceptedAt: null,
    expiresAt: { $lt: new Date() }
  })

  const rawToken = randomToken(24)
  const invite = await InviteModel.create({
    orgId: req.params.orgId,
    email,
    role: req.body.role,
    tokenHash: sha256(rawToken),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    invitedBy: req.user.id
  })

  return res.status(201).json({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
    inviteToken: rawToken
  })
}

export async function acceptInviteController(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized")
  }

  const invite = await InviteModel.findOne({
    tokenHash: sha256(req.body.token),
    acceptedAt: null,
    expiresAt: { $gt: new Date() }
  })

  if (!invite) {
    throw new HttpError(400, "Invalid or expired invite token")
  }

  const user = await UserModel.findById(req.user.id)

  if (!user) {
    throw new HttpError(404, "User not found")
  }

  if (normalizeEmail(user.email) !== invite.email) {
    throw new HttpError(403, "Invite email does not match the current user")
  }

  const existingMembership = await OrgMemberModel.findOne({
    orgId: invite.orgId,
    userId: req.user.id
  })

  if (!existingMembership) {
    await OrgMemberModel.create({
      orgId: invite.orgId,
      userId: req.user.id,
      role: invite.role,
      invitedBy: invite.invitedBy
    })
  }

  invite.acceptedAt = new Date()
  await invite.save()

  return res.status(200).json({
    success: true,
    orgId: invite.orgId.toString(),
    role: invite.role
  })
}

export async function updateMemberRoleController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(401, "Unauthorized")
  }

  const member = await OrgMemberModel.findOne({
    _id: req.params.memberId,
    orgId: req.params.orgId
  })

  if (!member) {
    throw new HttpError(404, "Member not found")
  }

  if (req.membership.role === "admin" && (member.role === "owner" || req.body.role === "owner")) {
    throw new HttpError(403, "Admins cannot change owner roles")
  }

  if (member.role === "owner" && req.body.role !== "owner") {
    const ownerCount = await OrgMemberModel.countDocuments({
      orgId: req.params.orgId,
      role: "owner"
    })

    if (ownerCount <= 1) {
      throw new HttpError(400, "Organization must have at least one owner")
    }
  }

  member.role = req.body.role
  await member.save()

  return res.status(200).json({
    success: true,
    id: member.id,
    role: member.role
  })
}

export async function removeMemberController(req: Request, res: Response): Promise<Response> {
  if (!req.user || !req.membership) {
    throw new HttpError(401, "Unauthorized")
  }

  const member = await OrgMemberModel.findOne({
    _id: req.params.memberId,
    orgId: req.params.orgId
  })

  if (!member) {
    throw new HttpError(404, "Member not found")
  }

  if (req.membership.role === "admin" && member.role === "owner") {
    throw new HttpError(403, "Admins cannot remove owners")
  }

  if (member.role === "owner") {
    const ownerCount = await OrgMemberModel.countDocuments({
      orgId: req.params.orgId,
      role: "owner"
    })

    if (ownerCount <= 1) {
      throw new HttpError(400, "Organization must have at least one owner")
    }
  }

  await member.deleteOne()

  return res.status(200).json({ success: true })
}
