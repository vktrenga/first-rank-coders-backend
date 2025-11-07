### Multi-stage Dockerfile for User service
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy repo
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Build the user workspace
RUN npm --workspace services/user run build

FROM node:18-alpine AS runner
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/services/user/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

ENV NODE_ENV=production
ARG PORT=3002
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["node","dist/main"]
