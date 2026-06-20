# Stage 1: Install workspace dependencies
FROM node:22.12.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY web/package*.json ./web/
RUN npm ci

# Stage 2: Build the Next.js app
FROM node:22.12.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV CHAT_ENGINE_API_URL=http://127.0.0.1:8080

RUN npm run build:web

# Stage 3: Production runner
FROM node:22.12.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV WEBSITES_PORT=8080
ENV SERVE_NEXT=true
ENV CHAT_ENGINE_API_URL=http://127.0.0.1:8080

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/web/package*.json ./web/
COPY --from=builder /app/web/.next ./web/.next
COPY --from=builder /app/web/public ./web/public
COPY --from=builder /app/web/next.config.mjs ./web/next.config.mjs
COPY --from=builder /app/server ./server

RUN npm ci --omit=dev --workspaces --include-workspace-root

EXPOSE 8080

CMD ["npm", "run", "start:azure"]
