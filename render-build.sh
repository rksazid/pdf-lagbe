#!/usr/bin/env bash
set -o errexit
set -o pipefail

echo "==> Installing dependencies..."
npm ci --production=false

echo "==> Compiling TypeScript..."
npm run build

echo "==> Setting up Puppeteer Chrome..."
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p "$PUPPETEER_CACHE_DIR"
npx puppeteer browsers install chrome

echo "==> Pruning dev dependencies..."
npm prune --production

echo "==> Build complete."
