# Docker Setup

## Purpose

This document defines the Docker architecture for Vibecode Match — two containers, one for the Colyseus game server and one for the Phaser client.

---

## Containers

| Container | Name              | Base image        | Serves                    |
| --------- | ----------------- | ----------------- | ------------------------- |
| Server    | `vibecode-server` | `node:lts-alpine` | Colyseus WebSocket server |
| Client    | `vibecode-client` | `nginx:alpine`    | Static Phaser/Vite build  |

---

## Project Layout (Expected)

```
/
├── server/          ← Colyseus backend
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── client/          ← Phaser frontend
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── shared/          ← Shared TypeScript types
│   └── src/
├── docker-compose.yml
└── docker-compose.override.yml   ← local dev overrides (not committed with secrets)
```

---

## Server Dockerfile

```dockerfile
# server/Dockerfile
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:lts-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 2567
CMD ["node", "dist/index.js"]
```

Key decisions:

- Multi-stage build: build dependencies are not in the final image.
- `npm ci --omit=dev` in the runtime stage to keep the image small.
- Default Colyseus port 2567.
- `NODE_ENV=production` set explicitly.

---

## Client Dockerfile

```dockerfile
# client/Dockerfile
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Key decisions:

- Vite builds a static bundle into `dist/`.
- nginx serves the static files.
- No Node.js runtime in the final client image.

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache busting: assets have hashed names, cache them aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: vibecode-server
    ports:
      - "${SERVER_PORT:-2567}:2567"
    environment:
      NODE_ENV: production
      PORT: 2567
    restart: unless-stopped

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: vibecode-client
    ports:
      - "${CLIENT_PORT:-80}:80"
    depends_on:
      - server
    restart: unless-stopped
```

### Environment Variables

All runtime configuration is provided through environment variables. No secrets or environment-specific values are hardcoded.

| Variable      | Default      | Description                                   |
| ------------- | ------------ | --------------------------------------------- |
| `SERVER_PORT` | `2567`       | Host port mapped to the Colyseus server       |
| `CLIENT_PORT` | `80`         | Host port mapped to the nginx client          |
| `NODE_ENV`    | `production` | Node environment                              |
| `PORT`        | `2567`       | Port Colyseus listens on inside the container |

The Colyseus server URL used by the Phaser client is injected at build time via a Vite environment variable:

```
# client/.env (not committed)
VITE_COLYSEUS_URL=ws://localhost:2567
```

In production/Docker builds, this is set to the actual server hostname.

---

## Local Development

For local development, use `docker-compose.override.yml` (not committed) or run each service with `npm run dev`:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

To run the full stack in Docker locally:

```bash
docker compose up --build
```

---

## Security Considerations

- The server container exposes only port 2567. It is not publicly accessible without a reverse proxy.
- The client container exposes port 80. In production, this should be behind a TLS-terminating reverse proxy (e.g. nginx, Caddy, or a cloud load balancer).
- No secrets are baked into Docker images. All secrets come from environment variables at runtime.
- The server image runs as a non-root user by default with `node:lts-alpine` (add `USER node` if a custom user is not set).
- Images use pinned base image tags in production builds to avoid unexpected upstream changes.

---

## Building and Running

```bash
# Build both images
docker compose build

# Start all containers
docker compose up -d

# View logs
docker compose logs -f

# Stop all containers
docker compose down
```
