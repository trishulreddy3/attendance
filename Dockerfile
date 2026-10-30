# ==============================================================================
# STAGE 1: Build Stage
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package descriptors for layer caching
COPY package.json package-lock.json ./

# Install dependencies deterministically
RUN npm ci

# Copy full application source code
COPY . .

# Build arguments for Vite configuration
ARG VITE_API_BASE_URL=/api
ARG VITE_WS_URL=/ws

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_WS_URL=$VITE_WS_URL

# Build the production Nitro SSR server and static client bundles
RUN npm run build

# ==============================================================================
# STAGE 2: Production Runtime Stage
# ==============================================================================
FROM node:22-alpine

LABEL maintainer="Pulse Attendance Team" \
      description="Production SSR frontend for Pulse Attendance Management System"

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Copy compiled standalone Nitro server output, package.json, and node_modules with non-root ownership
COPY --from=build --chown=node:node /app/.output ./.output
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules

# Run as non-root node user (standard in official node-alpine image)
USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
