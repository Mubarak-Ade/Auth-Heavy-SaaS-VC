export const orgRoles = ["owner", "admin", "member", "viewer"] as const

export const roleRank = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3
} as const
