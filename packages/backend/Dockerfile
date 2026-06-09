# syntax=docker/dockerfile:1
# Build context must be the repo root (monorepo workspaces + @klim/shared).
#   docker build -f packages/backend/Dockerfile -t klim-backend .

FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN npm ci
COPY packages/shared packages/shared
COPY packages/backend packages/backend
RUN npm run build --workspace=packages/shared \
 && npm run build --workspace=packages/backend

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN npm ci --omit=dev
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/backend/dist packages/backend/dist
COPY --from=builder /app/packages/backend/migrations packages/backend/migrations
USER app
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O- http://localhost:8090/health || exit 1
CMD ["node", "packages/backend/dist/index.js"]
