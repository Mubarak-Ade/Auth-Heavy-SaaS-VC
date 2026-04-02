# Auth-Heavy SaaS App — Architecture Documentation

> **Stack:** MongoDB · Express · React · Node.js · TypeScript  
> **Pattern:** Mini Notion / Task Manager with multi-user, multi-org support

---

## Table of Contents

1. [Overview](#1-overview)
2. [Phase 1 — Database & Models](#2-phase-1--database--models)
3. [Phase 2 — Auth Core](#3-phase-2--auth-core)
4. [Phase 3 — RBAC](#4-phase-3--rbac)
5. [Phase 4 — Security Layer](#5-phase-4--security-layer)
6. [Phase 5 — React Frontend](#6-phase-5--react-frontend)
7. [Phase 6 — Polish & Ops](#7-phase-6--polish--ops)
8. [Zod Validate Middleware](#8-zod-validate-middleware)
9. [Pre-Ship Checklist](#9-pre-ship-checklist)

---

## 1. Overview

### Core concepts

| Concept | Approach |
|---|---|
| Auth tokens | JWT access tokens (15 min) + opaque refresh tokens (7–30 days) |
| Token storage | Access token in memory · Refresh token in HTTP-only cookie |
| RBAC | Owner · Admin · Member · Viewer — enforced server-side on every mutation |
| Password reset | `crypto.randomBytes(32)` token, SHA-256 hashed before storage, 15 min expiry |
| Session management | Embedded refresh token array on User doc, rotation on every use |
| Rate limiting | Global + per-endpoint via `express-rate-limit` + Redis store |
| Input validation | Zod schemas — shared between backend middleware and React Hook Form |

### Key constraints

- **Access tokens are short-lived.** 15 min max. Never stored in `localStorage`.
- **Refresh tokens are opaque.** Store the SHA-256 hash only. Rotate on every use. Reuse = token theft — invalidate the entire token family immediately.
- **Permissions are always re-checked server-side.** Frontend RBAC gates are UX only. Every API mutation re-validates role via middleware.

### Build order

```
Phase 1 → DB schemas & indexes
Phase 2 → Auth core (register, login, refresh rotation, reset)
Phase 3 → RBAC middleware stack
Phase 4 → Security hardening (rate limits, Zod, Helmet)
Phase 5 → React frontend (auth context, interceptor, protected routes)
Phase 6 → Session UI, invitations, observability
```

---

## 2. Phase 1 — Database & Models

### MongoDB schemas

#### `User`

```ts
{
  _id:               ObjectId
  email:             string       // unique index
  passwordHash:      string
  emailVerified:     boolean
  createdAt:         Date
  resetToken:        string | null  // SHA-256 hash
  resetTokenExpiry:  Date | null
  refreshTokens:     SessionSchema[]
}
```

#### `SessionSchema` (embedded on User)

```ts
{
  tokenHash:  string   // SHA-256 of raw refresh token
  family:     string   // UUID — tracks rotation lineage for reuse detection
  expiresAt:  Date
  createdAt:  Date
  userAgent:  string
  ip:         string
}
```

#### `Organization`

```ts
{
  _id:       ObjectId
  name:      string
  slug:      string   // unique index
  plan:      'free' | 'pro' | 'enterprise'
  ownerId:   ObjectId
  createdAt: Date
}
```

#### `OrgMember` (join collection)

```ts
{
  userId:    ObjectId
  orgId:     ObjectId
  role:      'owner' | 'admin' | 'member' | 'viewer'
  joinedAt:  Date
  invitedBy: ObjectId | null
}
```

Compound unique index on `{ userId, orgId }`.

#### `Resource` (e.g. Page / Task)

```ts
{
  _id:        ObjectId
  orgId:      ObjectId
  createdBy:  ObjectId
  title:      string
  content:    string
  visibility: 'private' | 'org' | 'public'
  updatedAt:  Date
}
```

### Critical indexes

```
User.email                       → unique
User.refreshTokens.tokenHash     → for refresh lookups
User.resetToken                  → for password reset
OrgMember.{ userId, orgId }      → compound unique
Resource.orgId                   → for org-scoped queries
```

### Design notes

- **Refresh tokens embedded on User.** Keeps a refresh token lookup a single document read. Cap the array at ~5 active sessions; evict expired entries on login.
- **`OrgMember` is the source of truth for roles.** Never denorm role onto `User`. Always join `OrgMember` to get the role for the active org — supports multi-org membership cleanly.

---

## 3. Phase 2 — Auth Core

### Register flow

1. **Validate input** — Zod: email format, password min 8 chars + strength. Return `400` on failure — never reveal which field failed (prevents enumeration).
2. **Check uniqueness** — `User.findOne({ email })`. If found, return a generic "check your email" message — same response as if not found.
3. **Hash password** — `bcrypt.hash(password, 12)`. Cost factor 12 balances security and latency.
4. **Create user + issue tokens** — Insert User doc, generate access JWT (15 min) + opaque refresh token. Hash refresh before storing. Set HTTP-only cookie.

### Login flow

1. Validate input with Zod.
2. Find user by email — respond with generic error if not found (no enumeration).
3. `bcrypt.compare(password, user.passwordHash)`.
4. On success: evict expired sessions from `refreshTokens[]`, generate new token pair, return access JWT in body + refresh token as cookie.

### Refresh token rotation

```
1. Receive raw refresh token from HTTP-only cookie
2. Hash it: SHA-256(rawToken)
3. Find User where refreshTokens.tokenHash === hash AND expiresAt > now
4. If not found but family ID exists → REUSE DETECTED
   → Invalidate entire family ($pull all tokens with that family)
   → Return 401
5. Remove old session from array ($pull by tokenHash)
6. Generate new raw token (same family UUID)
7. Hash and push new session onto refreshTokens[]
8. Issue new access JWT
9. Set new cookie
```

### Password reset flow

```
1. POST /auth/reset-request { email }
   → Find user. If not found: return 200 anyway (no enumeration)
   → rawToken = crypto.randomBytes(32).toString('hex')
   → user.resetToken = SHA256(rawToken)
   → user.resetTokenExpiry = Date.now() + 15 * 60 * 1000
   → Save user
   → Email magic link containing rawToken

2. POST /auth/reset-confirm { token, newPassword }
   → hash = SHA256(token)
   → Find user where resetToken === hash AND resetTokenExpiry > now
   → If not found: return 400 (invalid or expired)
   → user.passwordHash = bcrypt.hash(newPassword, 12)
   → user.resetToken = null
   → user.resetTokenExpiry = null
   → user.refreshTokens = []   ← invalidate ALL sessions
   → Save user
```

### Token configuration

| Token | Type | TTL | Storage |
|---|---|---|---|
| Access JWT | Signed JWT (RS256 or HS256) | 15 min | In-memory (React state) |
| Refresh token | Opaque 32-byte random | 7–30 days | HTTP-only cookie |
| Reset token | Opaque 32-byte random | 15 min | SHA-256 hash in DB |

### Cookie configuration

```ts
res.cookie('refreshToken', rawToken, {
  httpOnly:  true,
  secure:    true,                    // HTTPS only
  sameSite:  'strict',
  path:      '/api/auth/refresh',     // restrict cookie scope
  maxAge:    7 * 24 * 60 * 60 * 1000, // 7 days
})
```

---

## 4. Phase 3 — RBAC

### Role hierarchy

| Role | Capabilities |
|---|---|
| `owner` | Full control. Cannot be removed. Transfer requires explicit ownership transfer. |
| `admin` | Manage members, invite, edit org settings. Cannot delete org or remove owner. |
| `member` | Create/read/update own resources. Read all org resources. |
| `viewer` | Read-only. Cannot create or modify anything. |

### Permission matrix

| Action | Owner | Admin | Member | Viewer |
|---|:---:|:---:|:---:|:---:|
| Delete org | ✓ | ✗ | ✗ | ✗ |
| Manage members | ✓ | ✓ | ✗ | ✗ |
| Invite users | ✓ | ✓ | ✗ | ✗ |
| Create resources | ✓ | ✓ | ✓ | ✗ |
| Edit own resources | ✓ | ✓ | ✓ | ✗ |
| Edit others' resources | ✓ | ✓ | ✗ | ✗ |
| Read org resources | ✓ | ✓ | ✓ | ✓ |
| Read private resources | own | own | own | ✗ |

### Middleware stack

```ts
// 1. Verify JWT
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// 2. Load org membership
export async function loadOrgMembership(req, res, next) {
  const { orgId } = req.params
  const membership = await OrgMember.findOne({ userId: req.user.id, orgId }).lean()
  if (!membership) return res.status(403).json({ error: 'Not a member' })
  req.membership = membership
  next()
}

// 3. Role guard factory
export function requireRole(...roles: OrgRole[]) {
  return (req, res, next) => {
    if (!roles.includes(req.membership.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

// 4. Resource ownership check (for member-level edits)
export async function checkResourceOwnership(req, res, next) {
  const resource = await Resource.findById(req.params.resourceId).lean()
  if (!resource) return res.status(404).json({ error: 'Not found' })

  const canEdit =
    ['owner', 'admin'].includes(req.membership.role) ||
    resource.createdBy.toString() === req.user.id

  if (!canEdit) return res.status(403).json({ error: 'Forbidden' })
  req.resource = resource
  next()
}
```

### Route composition examples

```ts
// Only owners can delete the org
router.delete('/org/:orgId',
  authenticate,
  loadOrgMembership,
  requireRole('owner'),
  deleteOrg
)

// Members can create resources, viewers cannot
router.post('/org/:orgId/resources',
  authenticate,
  loadOrgMembership,
  requireRole('owner', 'admin', 'member'),
  validate(createResourceSchema),
  createResource
)

// Only the creator or an admin/owner can edit
router.patch('/org/:orgId/resources/:resourceId',
  authenticate,
  loadOrgMembership,
  checkResourceOwnership,
  validate(updateResourceSchema),
  updateResource
)
```

### Owner protection rule

Before any role-change or member-removal operation, verify the org would still have at least one `owner`:

```ts
const ownerCount = await OrgMember.countDocuments({ orgId, role: 'owner' })
if (ownerCount <= 1 && targetMember.role === 'owner') {
  return res.status(400).json({ error: 'Org must have at least one owner' })
}
```

---

## 5. Phase 4 — Security Layer

### Rate limiting configuration

```ts
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// Global — all API routes
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ client: redisClient }),
})

// Login — strict per-IP + per-email
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `${req.ip}:${req.body?.email ?? ''}`,
})

// Password reset request
const resetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,
  keyGenerator: (req) => req.body?.email ?? req.ip,
  handler: (req, res) => res.status(200).json({ message: 'Check your email' }), // silent drop
})

// Register
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
})
```

### Middleware order (`app.ts`)

```ts
app.use(helmet())
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: '50kb' }))

app.use('/api/auth/login',    loginRateLimiter)
app.use('/api/auth/register', registerRateLimiter)
app.use('/api/auth/reset',    resetRateLimiter)
app.use('/api',               globalRateLimiter)

app.use('/api/auth', authRouter)
app.use('/api',      authenticate, orgRouter)

app.use(errorHandler)
```

### Security checklist

| Measure | Implementation |
|---|---|
| Secure headers | `helmet()` — sets CSP, HSTS, X-Frame-Options, nosniff |
| CORS | Strict origin whitelist. No wildcard in production. `credentials: true` only for known origins. |
| Input stripping | Zod strips unknown fields — `req.body` is replaced with parsed output |
| XSS prevention | `DOMPurify` server-side for any rich-text fields before DB write |
| Audit log | Log auth events (login, logout, failed attempt, reset, role change) with userId, IP, userAgent, timestamp |

---

## 6. Phase 5 — React Frontend

### Auth context shape

```ts
interface AuthContext {
  user:      { id: string; email: string } | null
  role:      OrgRole | null
  orgId:     string | null
  isLoading: boolean
  login:     (email: string, password: string) => Promise<void>
  logout:    () => Promise<void>
  switchOrg: (orgId: string) => void
}
```

### Axios interceptor — token refresh with request queue

```ts
import axios, { AxiosError } from 'axios'

let accessToken: string | null = null
let isRefreshing = false
let queue: Array<(token: string) => void> = []

const api = axios.create({ baseURL: '/api', withCredentials: true })

// Attach token to every request
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Handle 401 — refresh and retry
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
      accessToken = data.accessToken
      queue.forEach((cb) => cb(accessToken!))
      queue = []
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch {
      accessToken = null
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
```

### Protected routing

```tsx
// Redirects unauthenticated users, preserves returnTo
function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

// Hides UI for insufficient roles — NOT a security boundary
function RoleGate({ min, children }: { min: OrgRole; children: ReactNode }) {
  const { role } = useAuth()
  if (!role || roleRank[role] < roleRank[min]) return null
  return <>{children}</>
}

const roleRank: Record<OrgRole, number> = {
  viewer: 0, member: 1, admin: 2, owner: 3,
}
```

### Session rehydration on app load

```ts
// AuthProvider — rehydrate from refresh token cookie on mount
useEffect(() => {
  api.get('/auth/me')
    .then(({ data }) => setUser(data.user))
    .catch(() => setUser(null))
    .finally(() => setIsLoading(false))
}, [])
```

### Token storage rule

| Token | Storage | Rationale |
|---|---|---|
| Access JWT | In-memory React state / module variable | Lost on tab close — rehydrated via refresh cookie. Immune to XSS storage attacks. |
| Refresh token | HTTP-only cookie | Never readable by JS. SameSite=Strict blocks CSRF. Path-restricted to `/api/auth/refresh`. |
| ❌ Anything | `localStorage` | Any XSS on any page can read localStorage. Never store tokens here. |

---

## 7. Phase 6 — Polish & Ops

### Session management endpoints

```ts
// List active sessions
GET /api/auth/sessions
→ Returns: [{ id, userAgent, ip, createdAt, lastUsed }]

// Revoke a specific session
DELETE /api/auth/sessions/:sessionId
→ $pull the matching tokenHash from user.refreshTokens

// Revoke all sessions (e.g. after password change)
DELETE /api/auth/sessions
→ user.refreshTokens = []
```

### Invitation flow

```
1. Admin calls POST /api/org/:orgId/invites { email, role }
   → Generate signed JWT (email + orgId + role, 48hr expiry)
   → Store SHA-256 hash of token in DB
   → Email magic link containing raw token

2. Recipient visits /invite?token=<raw>
   → Verify token signature + expiry
   → If new user:  redirect to /register?email=...&invite=<token>
   → If existing:  POST /api/org/:orgId/invites/accept { token }
      → Create OrgMember record
      → Invalidate invite token in DB
```

### Session expiry cleanup (cron)

```ts
import cron from 'node-cron'

// Every hour: pull expired refresh token sessions from all users
cron.schedule('0 * * * *', async () => {
  await User.updateMany(
    {},
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  )
})
```

### Observability

**Auth events to log:**

```ts
type AuthEvent =
  | 'login.success' | 'login.failure'
  | 'logout'
  | 'token.refresh' | 'token.reuse_detected'
  | 'password.reset_requested' | 'password.reset_confirmed'
  | 'role.changed' | 'member.invited' | 'member.removed'

interface AuthLogEntry {
  event:       AuthEvent
  userId?:     string
  orgId?:      string
  ip:          string
  userAgent:   string
  timestamp:   Date
  correlationId: string
}
```

**Metrics to track:**
- Active session count per org
- 401 rate per endpoint (spike = credential stuffing)
- Rate limiter trigger rate
- Refresh token reuse events (any = potential token theft)
- Unusual login geolocation

---

## 8. Zod Validate Middleware

### `middleware/types.ts`

```ts
import { z, ZodTypeAny } from 'zod'
import type { Request } from 'express'

export interface RequestSchema {
  body?:   ZodTypeAny
  query?:  ZodTypeAny
  params?: ZodTypeAny
}

export type TypedRequest<S extends RequestSchema> = Request<
  S['params'] extends ZodTypeAny ? z.infer<S['params']> : Record<string, string>,
  unknown,
  S['body']  extends ZodTypeAny ? z.infer<S['body']>   : unknown,
  S['query'] extends ZodTypeAny ? z.infer<S['query']>  : qs.ParsedQs
>

export type ValidatedHandler<S extends RequestSchema> = (
  req: TypedRequest<S>,
  res: Response,
  next: NextFunction
) => void | Promise<void>
```

### `middleware/validate.ts`

```ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import type { RequestSchema } from './types'

export function validate<S extends RequestSchema>(schema: S) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = []

    if (schema.body) {
      const result = schema.body.safeParse(req.body)
      if (!result.success) errors.push(...formatErrors('body', result.error))
      else req.body = result.data
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query)
      if (!result.success) errors.push(...formatErrors('query', result.error))
      else req.query = result.data as typeof req.query
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params)
      if (!result.success) errors.push(...formatErrors('params', result.error))
      else req.params = result.data as typeof req.params
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', issues: errors })
      return
    }

    next()
  }
}

interface ValidationError {
  source:  'body' | 'query' | 'params'
  field:   string
  message: string
}

function formatErrors(source: ValidationError['source'], error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    source,
    field:   issue.path.join('.') || source,
    message: issue.message,
  }))
}
```

### `schemas/auth.schemas.ts`

```ts
import { z } from 'zod'
import type { RequestSchema } from '../middleware/types'

export const loginSchema = {
  body: z.object({
    email:    z.string().email(),
    password: z.string().min(1),
  }),
} satisfies RequestSchema

export const registerSchema = {
  body: z.object({
    email:    z.string().email(),
    password: z.string()
                .min(8, 'Password must be at least 8 characters')
                .regex(/[A-Z]/, 'Needs an uppercase letter')
                .regex(/[0-9]/, 'Needs a number'),
    name:     z.string().min(1).max(100).trim(),
  }),
} satisfies RequestSchema

export const getResourceSchema = {
  params: z.object({
    orgId:      z.string().uuid(),
    resourceId: z.string().uuid(),
  }),
  query: z.object({
    include: z.enum(['meta', 'full']).optional().default('meta'),
    page:    z.coerce.number().int().positive().optional().default(1),
    limit:   z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
} satisfies RequestSchema

export const createResourceSchema = {
  params: z.object({
    orgId: z.string().uuid(),
  }),
  body: z.object({
    title:      z.string().min(1).max(500).trim(),
    content:    z.string().max(100_000).optional(),
    visibility: z.enum(['private', 'org', 'public']).default('private'),
    tags:       z.array(z.string().trim().toLowerCase()).max(20).optional(),
  }),
} satisfies RequestSchema

// Inferred types — use in controllers
export type LoginBody          = z.infer<typeof loginSchema.body>
export type RegisterBody       = z.infer<typeof registerSchema.body>
export type CreateResourceBody = z.infer<typeof createResourceSchema.body>
export type GetResourceParams  = z.infer<typeof getResourceSchema.params>
export type GetResourceQuery   = z.infer<typeof getResourceSchema.query>
```

### Usage in a route file

```ts
router.post(
  '/',
  authenticate,
  loadOrgMembership,
  requireRole('owner', 'admin', 'member'),
  validate(createResourceSchema),
  async (req: TypedRequest<typeof createResourceSchema>, res) => {
    const { orgId }                          = req.params  // string (uuid)
    const { title, content, visibility, tags } = req.body  // fully typed

    const resource = await Resource.create({
      orgId, title, content, visibility, tags,
      createdBy: req.user.id,
    })
    res.status(201).json(resource)
  }
)
```

### 400 error response shape

```json
{
  "error": "Validation failed",
  "issues": [
    { "source": "body",   "field": "email",    "message": "Invalid email" },
    { "source": "body",   "field": "password", "message": "Password must be at least 8 characters" },
    { "source": "params", "field": "orgId",    "message": "Invalid uuid" }
  ]
}
```

### Mapping 400 errors to React Hook Form

```ts
import { AxiosError } from 'axios'
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'

export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>
): boolean {
  if (!(err instanceof AxiosError) || err.response?.status !== 400) return false

  const issues = err.response.data?.issues ?? []

  issues
    .filter((i: any) => i.source === 'body')
    .forEach((i: any) => {
      setError(i.field as Path<T>, { type: 'server', message: i.message })
    })

  return issues.some((i: any) => i.source === 'body')
}
```

> **Note:** Only `source === 'body'` issues map to form fields. Errors on `params` or `query` represent programming bugs — surface them as a toast/banner, not inline field errors.

---

## 9. Pre-Ship Checklist

```
Auth & tokens
[ ] HTTPS enforced, HSTS header enabled
[ ] Refresh token cookie: HttpOnly + Secure + SameSite=Strict
[ ] Refresh token cookie path restricted to /api/auth/refresh
[ ] Access tokens stored in memory only — never in localStorage
[ ] Refresh tokens stored as SHA-256 hash only — never raw
[ ] Token reuse detection implemented (family invalidation)
[ ] Password reset tokens hashed before storage
[ ] Reset token expiry <= 15 min
[ ] All sessions invalidated on password change

RBAC
[ ] Every mutation re-validates role server-side
[ ] Owner cannot be removed from org (last-owner guard)
[ ] Frontend RBAC gates (RoleGate) treated as UX only

Security
[ ] Rate limiting on: login, register, reset-request, global
[ ] Helmet middleware in place
[ ] CORS origin whitelist — no wildcard in production
[ ] Zod validate middleware strips unknown fields on all routes
[ ] DOMPurify applied to any rich-text input before DB write
[ ] Error messages are generic — no field enumeration on login/register

Ops
[ ] Auth events logged with userId, IP, userAgent, timestamp
[ ] Alerting on: 401 spike, any token reuse event, unusual geo
[ ] Expired session cleanup cron job running
[ ] Redis store configured for rate limiters (multi-instance safe)
```

---

*Generated from architecture planning session — MERN SaaS Auth App.*
