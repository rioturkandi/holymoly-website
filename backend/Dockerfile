FROM node:24-bookworm-slim AS frontend-build

WORKDIR /frontend

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build


FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node backend/ ./
COPY --from=frontend-build --chown=node:node /frontend/dist ./dist

RUN mkdir -p /app/uploads \
    && chown -R node:node /app

EXPOSE 8080

CMD ["sh", "-c", "chown -R node:node /app/uploads && exec su -s /bin/sh node -c 'node server.js'"]
