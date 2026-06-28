# ==============================================================================
# STAGE 1: Build Stage
# ==============================================================================
# We use a Node.js base image to compile the React/TypeScript frontend.
# 'node:22-alpine' is chosen because Node 22 is the LTS release and alpine is a
# minimal Linux distribution that keeps our final image size small.
FROM node:22-alpine AS build

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching.
COPY package.json package-lock.json ./

# Install project dependencies deterministic using npm ci.
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Inject Build Arguments.
# Vite builds embed environment variables (starting with VITE_) at build-time.
ARG VITE_API_BASE_URL
ARG VITE_WS_URL

# Set the Environment Variables during the build process.
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Compile the application.
# TanStack Start builds an SSR server and static asset bundles.
RUN npm run build

# ==============================================================================
# STAGE 2: Runtime Stage
# ==============================================================================
# Since TanStack Start is a full-stack SSR application, Nginx cannot run it.
# We must run a standalone Node.js server container to dynamically render pages.
FROM node:22-alpine

# Set the working directory for the runtime container.
WORKDIR /app

# Copy only the compiled standalone Nitro server output from the build stage.
# This contains the production code and assets in '.output/'.
COPY --from=build /app/.output ./.output

# Copy package.json to identify package versioning and scripts.
COPY --from=build /app/package.json ./package.json

# Copy production node_modules from the build stage.
# Nitro server requires runtime dependencies to execute correctly.
COPY --from=build /app/node_modules ./node_modules

# Expose port 3000 where the Nitro server listens by default.
EXPOSE 3000

# Start the standalone Nitro Node.js server.
# Using exec form so it receives host signals (like SIGTERM) for graceful shutdown.
CMD ["node", ".output/server/index.mjs"]
