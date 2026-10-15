# ---- Base Node ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# ---- Dependencies Stage ----
FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# ---- Build / Final Production Image ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy installed dependencies and Prisma engine
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma Client for the alpine container
RUN npx prisma generate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs

EXPOSE 5001

CMD ["node", "src/server.js"]
