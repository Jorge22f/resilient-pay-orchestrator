# STAGE 1: Base (Shared dependencies)
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/app
COPY package*.json ./

# STAGE 2: Development (For local coding)
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000

# STAGE 3: Builder (For production compilation)
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# STAGE 4: Production (The final tiny image)
FROM node:20-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/knexfile.js ./
COPY --from=builder /usr/src/app/migrations ./migrations
RUN npm install --omit=dev
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]