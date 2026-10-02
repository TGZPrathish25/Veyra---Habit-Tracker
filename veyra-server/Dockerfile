# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY prisma ./prisma/
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src/
RUN npm run build

# Stage 2: Production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY prisma ./prisma/
RUN npx prisma generate

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 veyra && \
    adduser --system --uid 1001 veyra
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY package.json ./

USER veyra
EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
