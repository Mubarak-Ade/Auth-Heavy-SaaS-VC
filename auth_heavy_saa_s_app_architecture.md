# Auth-Heavy SaaS App Documentation

## 1. Project Summary

### Product idea

Build an auth-heavy multi-user SaaS dashboard that feels like a mini Notion mixed with a task manager. Users can sign up, create or join organizations, invite teammates, manage structured work items, and collaborate inside an organization with strict access control.

### Product goal

The goal is to provide a secure collaboration platform where:

- multiple organizations can exist in the same product
- each organization has multiple users with different roles
- each user can manage tasks, notes, and lightweight workspace content
- all sensitive actions are protected by strong authentication and server-side authorization

### Primary use case

A startup, agency, or small internal team uses the app to:

- organize tasks
- store team notes
- assign work
- track progress
- collaborate safely across multiple users

### Product positioning

This is not a public social app. It is a private, account-driven B2B-style product where identity, session control, permissions, auditability, and team boundaries matter as much as the core task features.

---

## 2. Core Product Requirements

### Functional requirements

The app should support:

- user registration and login
- secure session handling
- password reset
- organization creation
- organization switching
- team invitations
- role-based access control
- task and note management
- activity visibility by organization
- session management and logout from devices

### Non-functional requirements

The app should be:

- secure by default
- scalable for many organizations
- easy to maintain
- friendly for frontend and backend teams
- structured for future billing, notifications, and analytics

### Success criteria

The product is successful when:

- users can securely authenticate without storing tokens unsafely
- organizations are cleanly isolated from each other
- permissions are enforced on every protected backend route
- a team can create, assign, update, and track work in one dashboard
- the system is production-ready with logging, validation, and deployment guidance

---

## 3. Recommended Tech Stack

### Main stack

- MongoDB
- Express.js
- React
- Node.js
- TypeScript

### Frontend

- React
- React Router
- React Hook Form
- Zod
- Axios
- Tailwind CSS or a component library such as shadcn/ui if desired

### Backend

- Express
- Mongoose
- Zod
- bcrypt
- jsonwebtoken
- cookie-parser
- helmet
- cors
- express-rate-limit
- Redis for shared rate limiting and caching

### DevOps and tooling

- Vite for frontend
- ESLint
- Prettier
- Vitest or Jest
- Supertest
- Docker
- GitHub Actions
- Nginx or cloud load balancer for production

---

## 4. User Types and Roles

### User types

- unauthenticated visitor
- authenticated user
- organization member
- organization administrator
- organization owner

### Organization roles

#### Owner

- full control over the organization
- can manage billing in the future
- can manage roles
- can delete organization
- cannot leave the organization if they are the last owner

#### Admin

- can invite and manage members
- can create and edit most organization resources
- cannot delete the organization
- cannot remove the last owner

#### Member

- can create tasks and notes
- can edit their own content
- can collaborate on shared organization resources

#### Viewer

- read-only access to shared organization content
- cannot create or modify resources

---

## 5. Product Scope

### MVP scope

The first version should include:

- authentication
- organization and member management
- dashboard layout
- task management
- note or document pages
- role-based permissions
- secure session management
- audit-friendly activity logging

### Version 2 scope

After MVP, the product can expand into:

- comments
- mentions
- notifications
- file uploads
- real-time collaboration
- billing and subscription plans
- advanced reporting
- calendar views
- workflow automation

---

## 6. Main Features

### Authentication

- register account
- login
- logout
- refresh session
- forgot password
- reset password
- email verification if enabled
- view active sessions
- revoke sessions

### Organization management

- create organization
- switch between organizations
- invite users by email
- accept invitation
- assign roles
- remove members
- update organization settings

### Dashboard

- personal overview
- organization overview
- assigned tasks
- recent notes
- activity feed
- upcoming deadlines

### Tasks

- create task
- update task
- assign task
- set status
- set priority
- add due date
- add description
- filter by assignee, status, or priority

### Notes or pages

- create rich text note
- edit note
- organize notes by workspace or category
- control note visibility

### Security and admin features

- role-based access checks
- audit events
- rate limiting
- session rotation
- device logout

---

## 7. High-Level Architecture

### System style

Use a client-server architecture with clear separation between frontend, API, database, and shared validation logic.

### Core layers

#### Frontend client

Responsible for:

- rendering UI
- managing auth state
- routing
- calling backend APIs
- showing permission-aware screens

#### Backend API

Responsible for:

- authentication
- authorization
- business logic
- validation
- session management
- organization and resource rules

#### Database

Responsible for:

- user data
- organization data
- membership records
- tasks
- notes
- refresh sessions
- audit logs

#### Infrastructure layer

Responsible for:

- Redis
- mail service
- file storage in future versions
- deployment
- observability

---

## 8. Multi-Tenant Data Model

This app should be organization-scoped. Every collaborative resource must belong to an organization so data stays isolated.

### Main entities

#### User

Stores identity and authentication details.

Suggested fields:

- `_id`
- `name`
- `email`
- `passwordHash`
- `emailVerified`
- `avatarUrl`
- `resetToken`
- `resetTokenExpiry`
- `refreshTokens`
- `createdAt`
- `updatedAt`

#### Session

Embedded or separate model for refresh tokens.

Suggested fields:

- `tokenHash`
- `family`
- `expiresAt`
- `createdAt`
- `lastUsedAt`
- `userAgent`
- `ip`

#### Organization

Represents a company, team, or workspace.

Suggested fields:

- `_id`
- `name`
- `slug`
- `plan`
- `ownerId`
- `createdAt`
- `updatedAt`

#### OrgMember

Join table between user and organization.

Suggested fields:

- `_id`
- `userId`
- `orgId`
- `role`
- `joinedAt`
- `invitedBy`

#### Invite

Tracks invitation flow safely.

Suggested fields:

- `_id`
- `orgId`
- `email`
- `role`
- `tokenHash`
- `expiresAt`
- `invitedBy`
- `acceptedAt`

#### Task

Main work unit.

Suggested fields:

- `_id`
- `orgId`
- `title`
- `description`
- `status`
- `priority`
- `assigneeId`
- `createdBy`
- `dueDate`
- `tags`
- `createdAt`
- `updatedAt`

#### Note

Lightweight Notion-style page or note.

Suggested fields:

- `_id`
- `orgId`
- `title`
- `content`
- `visibility`
- `createdBy`
- `updatedAt`

#### AuditLog

Tracks security-sensitive and organization-sensitive events.

Suggested fields:

- `_id`
- `event`
- `userId`
- `orgId`
- `targetId`
- `metadata`
- `ip`
- `userAgent`
- `createdAt`

### Important indexes

- `User.email` unique
- `Organization.slug` unique
- `OrgMember { userId, orgId }` unique compound
- `Task.orgId`
- `Task.assigneeId`
- `Note.orgId`
- `Invite.tokenHash`
- `AuditLog.orgId`

---

## 9. Authentication Design

Because this is an auth-heavy app, authentication is a core platform feature, not a side feature.

### Recommended auth model

- short-lived access token
- long-lived opaque refresh token
- HTTP-only cookie for refresh token
- access token stored only in memory

### Access token

- format: JWT
- lifespan: 15 minutes
- storage: in-memory only
- purpose: authenticate API requests

### Refresh token

- format: opaque random token
- lifespan: 7 to 30 days
- storage: HTTP-only secure cookie
- stored in database as SHA-256 hash only
- rotated every time it is used

### Why this approach

This design reduces the risk of XSS token theft and gives the backend full control over session invalidation.

### Auth flows

#### Register

1. Validate email, name, and password.
2. Check for existing user.
3. Hash password with bcrypt.
4. Create user.
5. Optionally create default organization.
6. Create access token and refresh token.
7. Return session to frontend.

#### Login

1. Validate request body.
2. Find user by email.
3. Compare password securely.
4. Create a new session entry.
5. Set refresh token cookie.
6. Return access token and basic user profile.

#### Refresh

1. Read refresh token from cookie.
2. Hash raw token.
3. find matching stored session.
4. rotate session token.
5. issue a new access token.
6. set a fresh refresh cookie.

#### Logout

1. Read refresh token.
2. Find hashed session entry.
3. Remove the session.
4. Clear cookie.

#### Forgot password

1. Accept email.
2. Return generic success response.
3. If user exists, generate raw reset token.
4. Store only hashed reset token and expiry.
5. Send email with reset link.

#### Reset password

1. Accept reset token and new password.
2. Hash incoming token.
3. Match against stored hash and expiry.
4. Replace password hash.
5. Clear reset token fields.
6. invalidate all refresh sessions.

---

## 10. Authorization and RBAC

### Principle

The frontend may hide buttons for a cleaner experience, but the backend must enforce every permission check.

### Authorization rules

- every org-scoped route must verify membership
- every mutation route must verify role
- ownership checks are required for user-owned resources
- owner protection must prevent removal of the final owner

### Permission examples

#### Owner

- delete org
- transfer ownership
- manage all members
- manage all resources

#### Admin

- invite users
- manage members except protected owner actions
- manage tasks and notes across the org

#### Member

- create tasks and notes
- edit assigned or owned items where allowed
- read organization resources

#### Viewer

- read-only access

### Middleware order

Recommended order:

1. authenticate request
2. validate route params and body
3. load organization membership
4. enforce role rules
5. run resource ownership checks where needed
6. execute controller logic

---

## 11. API Module Design

The API should be grouped by domain rather than by page.

### Auth routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/:sessionId`
- `DELETE /api/auth/sessions`

### Organization routes

- `POST /api/orgs`
- `GET /api/orgs`
- `GET /api/orgs/:orgId`
- `PATCH /api/orgs/:orgId`
- `DELETE /api/orgs/:orgId`

### Member and invite routes

- `GET /api/orgs/:orgId/members`
- `POST /api/orgs/:orgId/invites`
- `POST /api/orgs/:orgId/invites/accept`
- `PATCH /api/orgs/:orgId/members/:memberId/role`
- `DELETE /api/orgs/:orgId/members/:memberId`

### Task routes

- `GET /api/orgs/:orgId/tasks`
- `POST /api/orgs/:orgId/tasks`
- `GET /api/orgs/:orgId/tasks/:taskId`
- `PATCH /api/orgs/:orgId/tasks/:taskId`
- `DELETE /api/orgs/:orgId/tasks/:taskId`

### Note routes

- `GET /api/orgs/:orgId/notes`
- `POST /api/orgs/:orgId/notes`
- `GET /api/orgs/:orgId/notes/:noteId`
- `PATCH /api/orgs/:orgId/notes/:noteId`
- `DELETE /api/orgs/:orgId/notes/:noteId`

### Dashboard routes

- `GET /api/orgs/:orgId/dashboard`
- `GET /api/orgs/:orgId/activity`

---

## 12. Frontend Information Architecture

### Public pages

- landing page
- login
- register
- forgot password
- reset password
- invite acceptance page

### Authenticated pages

- dashboard
- my tasks
- notes
- organization members
- organization settings
- profile
- active sessions

### Suggested layout

#### App shell

- top navigation
- left sidebar
- main content area
- right detail panel later if needed

#### Sidebar sections

- dashboard
- tasks
- notes
- members
- settings

### UX principles

- org switcher should always be visible
- role-restricted actions should be hidden or disabled in the UI
- task status and priority should be easy to scan
- empty states should guide the user toward first actions

---

## 13. Frontend State and Auth Strategy

### Auth state

The frontend should store:

- current user
- selected organization
- current role in that organization
- loading state
- access token in memory

### Refresh strategy

- attach access token through Axios interceptor
- on 401, try one refresh request
- queue pending requests while refresh is in progress
- redirect to login if refresh fails

### Route protection

Use protected routes for authenticated areas and lightweight role gates for UX only.

### Form handling

Use React Hook Form plus Zod for:

- login
- registration
- password reset
- organization creation
- invite forms
- task creation and edit forms

---

## 14. Security Design

This app should treat security as a product feature.

### Required protections

- HTTP-only refresh cookies
- secure cookies in production
- short-lived access tokens
- password hashing with bcrypt
- hashed reset tokens
- hashed refresh tokens
- rate limiting
- strict CORS
- Helmet
- input validation
- output sanitization for rich text
- audit logs for sensitive events

### Rate limiting recommendations

- global API limiter
- stricter limiter for login
- stricter limiter for password reset
- invitation endpoints should also be protected

### Validation strategy

All request bodies, params, and queries should be validated with Zod.

### CSRF and cookie considerations

Because refresh tokens use cookies:

- keep refresh endpoint path-restricted
- use `SameSite=Strict` where possible
- only allow trusted frontend origins

### Security events to log

- login success
- login failure
- logout
- refresh success
- refresh reuse detection
- password reset requested
- password reset completed
- invite sent
- invite accepted
- role changed
- member removed

---

## 15. Background Jobs and Async Services

### Cron jobs

Recommended scheduled jobs:

- remove expired refresh sessions
- remove expired invites
- remove expired password reset tokens
- generate weekly activity summary in future versions

### Email service

Use a transactional email provider for:

- invitation emails
- password reset emails
- verification emails

### Future async needs

- notifications
- webhook processing
- analytics aggregation

---

## 16. Suggested Folder Structure

### Monorepo option

```txt
auth-heavy-saas/
  apps/
    web/
    api/
  packages/
    shared/
    ui/
    config/
  docs/
```

### Simpler two-app structure

```txt
root/
  client/
    src/
      app/
      components/
      features/
      hooks/
      lib/
      pages/
      routes/
  server/
    src/
      config/
      controllers/
      db/
      jobs/
      middleware/
      models/
      routes/
      schemas/
      services/
      utils/
      types/
```

### Backend module organization

Feature-based grouping is recommended:

- `auth`
- `orgs`
- `members`
- `tasks`
- `notes`
- `audit`

---

## 17. Environment Variables

Suggested backend environment variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=7
COOKIE_DOMAIN=
APP_ORIGIN=http://localhost:5173
API_ORIGIN=http://localhost:5000
REDIS_URL=
EMAIL_FROM=
EMAIL_PROVIDER_API_KEY=
```

Suggested frontend environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Auth Heavy SaaS
```

---

## 18. Development Plan From Start to Finish

### Phase 1: Product and system design

- finalize requirements
- define entities and role rules
- design API surface
- document auth flows

### Phase 2: Project setup

- initialize frontend and backend apps
- set up TypeScript
- configure linting and formatting
- configure environment loading
- set up shared constants and schemas

### Phase 3: Database and models

- connect MongoDB
- create user model
- create organization model
- create membership model
- create invite model
- create task model
- create note model
- add indexes

### Phase 4: Auth implementation

- register
- login
- logout
- refresh rotation
- forgot password
- reset password
- session listing and revocation

### Phase 5: RBAC and membership flows

- org creation
- org membership lookup
- invite sending
- invite acceptance
- role updates
- member removal

### Phase 6: Core app features

- dashboard summary endpoint
- task CRUD
- note CRUD
- task filtering and assignment
- org switcher

### Phase 7: Frontend app shell

- routing
- auth provider
- protected routes
- dashboard layout
- member management screens
- tasks and notes screens

### Phase 8: Security hardening

- rate limiting
- Helmet
- CORS restrictions
- Zod validation
- sanitization
- audit logging

### Phase 9: Testing and QA

- unit tests
- API integration tests
- auth flow tests
- role permission tests
- frontend interaction tests

### Phase 10: Production readiness

- Docker
- CI pipeline
- deployment setup
- monitoring
- backup strategy
- documentation handoff

---

## 19. Testing Strategy

### Backend tests

Test:

- register and login flows
- refresh rotation
- invalid refresh reuse
- password reset
- invite acceptance
- role guards
- owner protection
- task and note permissions

### Frontend tests

Test:

- login and logout flow
- route protection
- dashboard rendering
- task create and edit forms
- role-based UI visibility

### End-to-end tests

Critical E2E flows:

1. register and create first organization
2. invite a second user
3. accept invite
4. create and assign task
5. update task status
6. revoke a session
7. reset password and ensure sessions are invalidated

---

## 20. Deployment Architecture

### Minimum production setup

- React frontend deployed separately
- Node API deployed behind HTTPS
- MongoDB managed instance
- Redis managed instance
- transactional email provider

### Production concerns

- HTTPS only
- secure cookie settings
- environment secret management
- DB backups
- application logs
- health checks
- uptime monitoring

### CI/CD pipeline

A typical pipeline should:

1. install dependencies
2. run lint
3. run tests
4. build frontend and backend
5. build Docker images if used
6. deploy to staging
7. run smoke tests
8. deploy to production

---

## 21. Observability and Monitoring

### Logs

Log:

- request id
- user id where available
- org id where available
- event name
- status code
- latency

### Metrics

Track:

- login failures
- refresh failures
- 401 rates
- rate limiter triggers
- task creation volume
- active users per org

### Alerts

Alert on:

- sudden spike in failed logins
- refresh reuse detection
- repeated 500 errors
- unusual traffic patterns

---

## 22. Risks and Mitigations

### Risk: weak authorization

Mitigation:

- centralize RBAC middleware
- enforce org membership on all org routes
- add tests for every protected action

### Risk: token theft or bad token storage

Mitigation:

- keep access token in memory only
- use HTTP-only refresh cookie
- hash refresh tokens in database
- rotate refresh tokens

### Risk: tenant data leakage

Mitigation:

- require `orgId` scoping on collaborative queries
- filter every task and note query by `orgId`
- use membership middleware early in request flow

### Risk: owner lockout

Mitigation:

- prevent removal of last owner
- require explicit ownership transfer flow

---

## 23. Future Roadmap

After the MVP is stable, the next upgrades can include:

- real-time collaboration with WebSockets
- comments and mentions
- recurring tasks
- project boards
- file attachments
- public share links for read-only notes
- billing and subscriptions
- SSO and enterprise auth
- audit export for admins

---

## 24. Final Build Recommendation

The app should be built as a secure multi-tenant collaboration platform first and a task manager second. That order matters. The strongest version of this product is one where:

- authentication is reliable
- session handling is secure
- organizations are properly isolated
- permissions are consistent
- collaboration features are layered on top of a safe foundation

If this foundation is done well, the product can grow naturally into a more complete workspace platform with documents, tasks, teams, billing, and enterprise controls.

---

## 25. Delivery Summary

This documentation defines the product from start to finish:

- what the app is
- who it is for
- what features it includes
- how authentication works
- how multi-tenant roles work
- how the frontend and backend should be structured
- how to build it in phases
- how to secure it
- how to test and deploy it

It can now act as the main implementation reference for designing, building, and shipping the Auth-Heavy SaaS App.
