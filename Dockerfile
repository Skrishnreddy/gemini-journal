# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Minimal Container
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built frontend bundle and server source
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY firestore.rules ./

# Security: Run as non-root user
USER node

EXPOSE 8080
CMD ["node", "server/index.js"]
