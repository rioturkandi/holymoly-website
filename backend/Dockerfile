# ==========================================
# STAGE 1: Build frontend React + Vite
# ==========================================
FROM node:24-bookworm-slim AS frontend-build

WORKDIR /frontend

# Menyalin dependency frontend
COPY package*.json ./

# Memasang dependency untuk proses build
RUN npm ci

# Menyalin source code frontend
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

# Menghasilkan frontend production di /frontend/dist
RUN npm run build


# ==========================================
# STAGE 2: Production backend + frontend
# ==========================================
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Menyalin dependency backend
COPY backend/package*.json ./

# Memasang dependency production saja
RUN npm ci --omit=dev

# Menyalin source code backend
COPY --chown=node:node backend/ ./

# Menyalin hasil build frontend ke /app/dist
COPY --from=frontend-build --chown=node:node /frontend/dist ./dist

# Menyiapkan folder upload untuk persistent volume Railway
RUN mkdir -p /app/uploads \
    && chown -R node:node /app

# Menjalankan aplikasi menggunakan user non-root
USER node

EXPOSE 8080

CMD ["node", "server.js"]
