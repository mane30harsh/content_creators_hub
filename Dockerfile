# ─── Base ───────────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
EXPOSE 3000

# ─── Dependencies ──────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ─── Builder ───────────────────────────────────────────────────
FROM base AS builder
COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/
RUN npm ci --ignore-scripts && npx prisma generate
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runner ────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx

USER nextjs
CMD ["sh", "-c", "node /app/node_modules/prisma/build/index.js migrate deploy && node server.js"]
