### Multi-stage Dockerfile for Contest service
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy repository
COPY . .

# Install deps
RUN npm install --legacy-peer-deps

# Build the contest workspace
RUN npm --workspace services/contest run build

FROM node:18-alpine AS runner
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/services/contest/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

ENV NODE_ENV=production
ARG PORT=3003
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["node","dist/main"]
