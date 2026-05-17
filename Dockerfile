# 빌드 단계
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# 실행 단계
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache \
  libc6-compat \
  curl

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${APP_PORT:-3000}/health || exit 1

EXPOSE ${APP_PORT:-3000}

CMD ["node", "dist/main"]
