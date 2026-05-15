FROM node:20-alpine AS base

WORKDIR /app

# ── Dependency stage ──────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm install

# ── Builder stage ─────────────────────────────────────────
FROM base AS builder
ARG NEXT_PUBLIC_API_URL=http://localhost/api
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost
ARG NEXT_PUBLIC_JITSI_DOMAIN=localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_JITSI_DOMAIN=$NEXT_PUBLIC_JITSI_DOMAIN

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Runner stage ──────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy everything needed to run `next start`
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
