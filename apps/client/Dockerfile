# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy package manifests for all workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# Install all dependencies
RUN npm ci --ignore-scripts

# Copy shared package source
COPY packages/shared/ ./packages/shared/

# Copy client source
COPY apps/client/ ./apps/client/

# Build the Vite app
WORKDIR /app/apps/client
ARG VITE_API_BASE_URL=http://localhost:4000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# ---- Stage 2: Production (nginx) ----
FROM nginx:1.25-alpine AS production

# Copy built assets
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]