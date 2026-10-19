FROM node:22-bookworm-slim

ENV WRANGLER_SEND_METRICS=false \
    WRANGLER_WRITE_LOGS=false \
    XDG_CONFIG_HOME=/data/.config \
    WRANGLER_LOG_PATH=/data/logs/wrangler.log \
    WRANGLER_REGISTRY_PATH=/data/wrangler-registry \
    MINIFLARE_REGISTRY_PATH=/data/miniflare-registry

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8787/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["sh", "scripts/vps-entrypoint.sh"]
