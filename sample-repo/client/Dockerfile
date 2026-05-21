FROM node:lts-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared/ ./shared/
COPY client/package*.json ./client/

RUN npm ci --workspace=shared --workspace=client

COPY shared/ ./shared/
COPY client/ ./client/

ARG VITE_COLYSEUS_URL=ws://localhost:2567
ENV VITE_COLYSEUS_URL=$VITE_COLYSEUS_URL

WORKDIR /app/client
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
