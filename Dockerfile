# ---- Build stage ----
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # Enable pnpm via corepack
    RUN corepack enable
    
    # Copy only files needed to install deps (better caching)
    COPY package.json pnpm-lock.yaml ./
    
    # Install deps
    RUN pnpm install --frozen-lockfile
    
    # Copy source and build
    COPY . .
    RUN pnpm run build
    
    # ---- Runtime stage ----
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV HOST=0.0.0.0
    ENV PORT=3000
    
    # Copy Nuxt output only
    COPY --from=build /app/.output ./.output
    
    EXPOSE 3000
    CMD ["node", ".output/server/index.mjs"]
    