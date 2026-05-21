FROM node:lts-alpine AS builder
WORKDIR /app

# Copy workspace root and shared package first for better layer caching
COPY package*.json ./
COPY shared/ ./shared/
COPY server/package*.json ./server/

RUN npm ci --workspace=shared --workspace=server

COPY server/ ./server/

WORKDIR /app/server
RUN npm run build

FROM node:lts-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY shared/ ./shared/
COPY server/package*.json ./server/

RUN npm ci --workspace=shared --workspace=server --omit=dev

COPY --from=builder /app/server/dist ./server/dist

WORKDIR /app/server
EXPOSE 2567
CMD ["node", "dist/index.js"]
