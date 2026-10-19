#!/bin/sh
set -eu

mkdir -p /data/.config /data/logs /data/wrangler-registry /data/miniflare-registry

node node_modules/wrangler/bin/wrangler.js d1 migrations apply DB \
  --local \
  --config wrangler.vps.jsonc \
  --persist-to /data

exec node node_modules/wrangler/bin/wrangler.js dev \
  --local \
  --config wrangler.vps.jsonc \
  --persist-to /data \
  --ip 0.0.0.0 \
  --port 8787 \
  --inspector-port 0 \
  --log-level info
