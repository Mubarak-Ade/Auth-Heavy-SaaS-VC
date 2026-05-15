# Auth Heavy SaaS

Monorepo scaffold for a multi-tenant auth-heavy SaaS app with:

- `apps/server` for the Express + TypeScript backend
- `apps/client` for the React + TypeScript frontend
- `packages/shared` for shared role, auth, and domain types

## Getting started

1. Install dependencies in the workspace root with `npm install`.
2. Start Redis locally on `redis://localhost:6379` or point `apps/server/.env` at your Redis instance.
3. Copy `apps/server/.env.example` to `.env` values for your backend setup.
4. Copy `apps/client/.env.example` if you want to override the default client API URL.
5. Run `npm run dev` to start the server and client together.
6. Run `npm run typecheck` and `npm run build` to verify the workspace.

## Workspace commands

- `npm run dev`
- `npm run dev:server`
- `npm run dev:client`
- `npm run typecheck`
- `npm run build`

## Redis Usage

Redis is now used in the backend for shared, short-lived state that should not depend on one API process.

Detailed Redis documentation lives in [`docs/redis.md`](/home/aim/project/Auth Heavy Saas/docs/redis.md).

Why Redis is used:

- shared API rate limiting so limits still work correctly when the server is scaled to multiple instances
- refresh-token family revocation so logout, password reset, and replay detection invalidate a token family across all instances immediately

Where Redis is used:

- [`apps/server/src/middleware/rate-limit.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/middleware/rate-limit.ts) stores `express-rate-limit` counters in Redis with the `rate-limit-redis` store
- [`apps/server/src/services/refresh-family-store.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/services/refresh-family-store.ts) keeps revoked refresh-token families in Redis until their normal expiry time
- [`apps/server/src/services/auth.service.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/services/auth.service.ts) writes to that Redis revocation store during refresh-token replay detection, logout, password reset, and session revocation flows
- [`apps/server/src/lib/redis.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/lib/redis.ts) owns the shared Redis client connection used by the server

Configuration:

- `REDIS_ENABLED=true` turns Redis-backed features on
- `REDIS_URL=redis://localhost:6379` points the backend at your Redis instance
- tests set `REDIS_ENABLED=false` so route tests can run without requiring a Redis server

## Next implementation steps

- expand Redis usage for background jobs, caching, and queues when those features are added
- finish auth services and persistence
- implement invite email delivery
- connect frontend forms to backend endpoints
- add tests for auth and RBAC
