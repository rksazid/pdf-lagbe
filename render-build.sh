#!/usr/bin/env bash
set -o errexit
set -o pipefail

# Chrome must be stored INSIDE the project directory — Render only
# deploys /opt/render/project/src, so /opt/render/.cache is lost at runtime.
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.puppeteer

echo "==> Installing dependencies..."
npm ci --production=false

echo "==> Compiling TypeScript..."
npm run build

echo "==> Setting up Puppeteer Chrome..."
mkdir -p "$PUPPETEER_CACHE_DIR"
npx puppeteer browsers install chrome
echo "    Chrome installed to $PUPPETEER_CACHE_DIR"

echo "==> Pruning dev dependencies..."
npm prune --production

echo "==> Build complete."
