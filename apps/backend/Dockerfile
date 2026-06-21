# Build et exécution du backend Express. Contexte de build = racine du monorepo.
FROM node:20-alpine AS base
WORKDIR /app

# --- Dépendances (dev incluses : tsx requis pour les migrations Knex) ---
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci

# --- Compilation TypeScript -> dist ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/backend ./apps/backend
RUN npm run build -w apps/backend

# --- Image d'exécution ---
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/knexfile.ts ./apps/backend/knexfile.ts
COPY apps/backend/migrations ./apps/backend/migrations
COPY apps/backend/seeds ./apps/backend/seeds
COPY apps/backend/templates ./apps/backend/templates
COPY apps/backend/docker-entrypoint.sh ./apps/backend/docker-entrypoint.sh
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

RUN mkdir -p ./apps/backend/storage/generated-documents \
  && chmod +x ./apps/backend/docker-entrypoint.sh \
  && addgroup -S nodejs && adduser -S nodejs -G nodejs \
  && chown -R nodejs:nodejs /app/apps/backend/storage
USER nodejs

WORKDIR /app/apps/backend
EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
