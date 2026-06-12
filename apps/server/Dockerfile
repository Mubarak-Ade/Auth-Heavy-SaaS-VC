# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy package manifests for all workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# Install all dependencies (needed to resolve workspace links)
RUN npm ci --ignore-scripts

# Copy shared package source and build it
COPY packages/shared/ ./packages/shared/

# Copy server source and build
COPY apps/server/ ./apps/server/

WORKDIR /app/apps/server
RUN npm run build


# ---- Stage 2: Production ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy only production package manifests
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/apps/server

EXPOSE 4000

CMD ["node", "dist/server.js"]