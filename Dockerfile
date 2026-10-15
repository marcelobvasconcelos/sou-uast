# ==========================================
# Multi-stage Dockerfile para Next.js Standalone
# SOU+UAST - UAST / UFRPE
# ==========================================

# 1. Base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl netcat-openbsd
WORKDIR /app

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG BASE_PATH=""
ENV BASE_PATH=$BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$BASE_PATH

# Gerar Prisma Client e Compilar Next.js Standalone
RUN npx prisma generate
RUN npm run build

# 4. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV BASE_PATH=$BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$BASE_PATH

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos estáticos e standalone do build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copiar script de inicialização e gateway de rotas
COPY --from=builder /app/run-server.js ./run-server.js
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

# Criar e configurar diretório persistente de uploads
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads /app/.next

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/soumaisuast/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
