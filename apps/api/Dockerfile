FROM node:22 AS base

FROM base AS deps

WORKDIR /app

COPY package*.json package-lock.json ./

RUN npm ci

FROM base AS build

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules  ./node_modules

RUN npx prisma generate
RUN npm run build
RUN npm prune --prod

FROM node:22-alpine AS deploy

RUN apk update && apk upgrade --no-cache && apk add --no-cache curl openssl

WORKDIR /app

COPY --from=build /app/node_modules  ./node_modules
COPY --from=build /app/dist         ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma       ./prisma

RUN npx prisma generate

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/main"]
