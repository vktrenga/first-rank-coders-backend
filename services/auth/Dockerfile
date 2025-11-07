### Multi-stage Dockerfile for Auth service (builds whole monorepo then extracts the service)
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy everything (we build from the repo root to support workspaces/libs)
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Build only the auth workspace
RUN npm --workspace services/auth run build

### Production image
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copy built service and node_modules from build stage
COPY --from=build /usr/src/app/services/auth/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

ENV NODE_ENV=production
ARG PORT=3001
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["node", "dist/main"]
