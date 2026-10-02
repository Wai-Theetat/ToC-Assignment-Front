# Frontend Dockerfile - Next.js 16 with pnpm (Multi-stage build)
FROM node:20-alpine AS base

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package management files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY .npmrc* ./

# Install dependencies strictly matching lockfile
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass NEXT_PUBLIC_API_URL during build time for Next.js static asset compilation
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js standalone output
RUN pnpm build

# Production runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
