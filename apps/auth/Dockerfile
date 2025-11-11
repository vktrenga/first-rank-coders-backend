FROM node:18-alpine

WORKDIR /app

# Copy everything from monorepo root (since context is root)
COPY . .

# Go inside user service
WORKDIR /app/apps/auth

# Install dependencies (including shared lib)
RUN npm install --legacy-peer-deps

# Build shared lib
RUN ls -la /app/libs/shared
RUN npm --prefix ../../libs/shared run build

# Build user service
RUN npm run build

CMD ["node", "dist/main.js"]
