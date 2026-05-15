# Stage 1: Development
FROM node:20-alpine AS development

RUN apk update && apk upgrade --no-cache
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "tsx", "watch", "src/index.ts"]


# Stage 2: Production Build
FROM node:20-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc


# Stage 3: Production Runtime (The "Staff" Lean Move)
FROM node:20-alpine AS production

RUN apk update && apk upgrade --no-cache
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist

USER node

CMD ["node", "dist/index.js"]