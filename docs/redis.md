# Redis Integration

This project uses Redis in the backend for shared, short-lived state that should not depend on a single API process.

## Why Redis Is Used

- Rate-limit counters need to be shared across API instances.
- Refresh-token revocation needs to propagate immediately across API instances.
- These values are temporary and expire naturally, which fits Redis well.

## Where Redis Is Used

### Shared Redis Client

File: [`apps/server/src/lib/redis.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/lib/redis.ts)

Responsibilities:

- creates the server Redis client with `redis`
- reuses a single client instance across the backend
- connects Redis during server bootstrap
- exposes readiness status for the health endpoint

## API Rate Limiting

File: [`apps/server/src/middleware/rate-limit.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/middleware/rate-limit.ts)

How it works:

- `express-rate-limit` handles the rate-limiting rules
- `rate-limit-redis` stores counters in Redis instead of memory
- this makes rate limits consistent when multiple server instances are running

Why Redis is a good fit here:

- in-memory limits are isolated per process
- Redis keeps the counters centralized
- the counter data is short-lived and automatically expires

## Refresh-Token Family Revocation

Files:

- [`apps/server/src/services/refresh-family-store.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/services/refresh-family-store.ts)
- [`apps/server/src/services/auth.service.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/services/auth.service.ts)

How it works:

- each refresh token belongs to a token family
- when a token family should no longer be trusted, its family id is written to Redis
- the Redis key lives only until the family would naturally expire
- refresh requests check Redis before allowing the token family to continue

Redis-backed revocation is used during:

- refresh-token replay detection
- logout
- password reset
- session revocation
- revoke-all-sessions

Why Redis is a good fit here:

- revocation state needs to be visible across all API instances immediately
- the data is temporary and TTL-based
- this avoids relying on one process's memory to remember that a token family was revoked

## Configuration

Files:

- [`apps/server/src/config/env.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/config/env.ts)
- [`apps/server/.env.example`](/home/aim/project/Auth Heavy Saas/apps/server/.env.example)

Environment variables:

- `REDIS_ENABLED`
- `REDIS_URL`

Defaults:

- `REDIS_ENABLED=true` outside test
- `REDIS_URL=redis://localhost:6379`

Test behavior:

- tests set `REDIS_ENABLED=false`
- this keeps unit and route tests fast and independent from a running Redis server

## Startup And Health

Files:

- [`apps/server/src/server.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/server.ts)
- [`apps/server/src/app.ts`](/home/aim/project/Auth Heavy Saas/apps/server/src/app.ts)

Behavior:

- the server connects to Redis during bootstrap
- `/health` reports Redis as `connected`, `connecting`, or `disabled`

## Operational Notes

- If Redis is enabled, the backend expects a reachable Redis instance at startup.
- If you do not want Redis locally for a given environment, set `REDIS_ENABLED=false`.
- Current Redis usage is intentionally focused on shared security and throttling state.
- Redis is not yet used for queues, general caching, background jobs, or pub/sub in this project.
