# Auth Heavy SaaS

Monorepo scaffold for a multi-tenant auth-heavy SaaS app with:

- `apps/server` for the Express + TypeScript backend
- `apps/client` for the React + TypeScript frontend
- `packages/shared` for shared role, auth, and domain types

## Getting started

1. Install dependencies in the workspace root with `npm install`.
2. Copy `apps/server/.env.example` to `.env` values for your backend setup.
3. Copy `apps/client/.env.example` if you want to override the default client API URL.
4. Run `npm run dev` to start the server and client together.
5. Run `npm run typecheck` and `npm run build` to verify the workspace.

## Workspace commands

- `npm run dev`
- `npm run dev:server`
- `npm run dev:client`
- `npm run typecheck`
- `npm run build`

## Next implementation steps

- wire MongoDB and Redis
- finish auth services and persistence
- implement invite email delivery
- connect frontend forms to backend endpoints
- add tests for auth and RBAC
