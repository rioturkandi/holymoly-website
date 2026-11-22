FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

RUN mkdir -p /app/uploads \
    && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "server.js"]
