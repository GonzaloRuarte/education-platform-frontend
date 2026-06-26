# syntax=docker.io/docker/dockerfile:1

FROM node:alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src

RUN npm run build

FROM nginx:alpine AS runner

ENV API_BASE_URL=http://localhost:8000/api

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY scripts/runtime/write-frontend-config.sh /docker-entrypoint.d/10-retrobolt-config.sh
RUN chmod +x /docker-entrypoint.d/10-retrobolt-config.sh

EXPOSE 80
