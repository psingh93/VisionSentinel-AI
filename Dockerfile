# VisionSentinel AI - Full-Stack Production Container
# OpenCV AI Competition 2026 - AWS ECS Fargate & App Runner Ready
FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source and build distribution
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Copy assets and server code
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { if (r.statusCode !== 200) process.exit(1); });"

CMD ["npm", "start"]
