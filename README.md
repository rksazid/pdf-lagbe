# pdf-lagbe

Document-to-PDF API service. Convert HTML, Markdown, or DOCX files to PDF with full JavaScript execution, syntax highlighting, and 3-layer security.

Built with Node.js, TypeScript, Express, and Puppeteer.

## Features

- **HTML-to-PDF** — Full CSS/JS rendering with Chart.js, QRCode.js, Tailwind CSS, CDN support
- **Markdown-to-PDF** — GitHub Flavored Markdown with tables, task lists, code syntax highlighting
- **DOCX-to-PDF** — Word document conversion with embedded images
- **CDN support** — Load scripts/styles from jsdelivr, cdnjs, unpkg, Google Fonts, Tailwind CSS
- **Images from any HTTPS host** — Clients can embed images from their own servers
- **3-layer security** — DOMPurify sanitization, runtime API overrides, network interception
- **Configurable output** — Page format, orientation, margins, scale, headers/footers
- **Rate limiting** — Per-IP request throttling
- **Health checks** — Browser status, memory usage, uptime
- **Structured logging** — JSON logs in production, pretty console in development

## Quick Start

**Prerequisites:** Node.js >= 20

```bash
git clone https://github.com/rksazid/pdf-lagbe.git
cd pdf-lagbe
npm install
npm run dev
```

Generate a PDF from HTML:

```bash
curl -X POST http://localhost:3000/api/v1/html-to-pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Hello World</h1>"}' \
  --output hello.pdf
```

Generate a PDF from Markdown:

```bash
curl -X POST http://localhost:3000/api/v1/md-to-pdf \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World\n\n| A | B |\n|---|---|\n| 1 | 2 |"}' \
  --output hello-md.pdf
```

## API Reference

### `POST /api/v1/html-to-pdf`

Generate a PDF from HTML content.

**Request body** (JSON):

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `html` | string | *required* | HTML content (max 2 MB) |
| `format` | string | `"A4"` | `A4`, `Letter`, `A3`, `Legal`, `Tabloid` |
| `landscape` | boolean | `false` | Landscape orientation |
| `margin` | object | `1cm` all sides | `{ top, right, bottom, left }` as CSS strings |
| `printBackground` | boolean | `true` | Include background colors/images |
| `scale` | number | `1` | Scale factor (0.1 – 2.0) |
| `displayHeaderFooter` | boolean | `false` | Show header and footer |
| `headerTemplate` | string | — | Header HTML (max 10 KB) |
| `footerTemplate` | string | — | Footer HTML (max 10 KB) |
| `preferCSSPageSize` | boolean | `false` | Use `@page` CSS size over `format` |
| `waitForSelector` | string | — | CSS selector to wait for before rendering |
| `waitForTimeout` | number | — | Extra wait in ms (0 – 5000) for JS to finish |

### `POST /api/v1/md-to-pdf`

Generate a PDF from Markdown text with GitHub-style rendering and syntax highlighting.

**Request body** (JSON):

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `markdown` | string | *required* | Markdown content (max 2 MB) |
| `format` | string | `"A4"` | Page format |
| `landscape` | boolean | `false` | Landscape orientation |
| `margin` | object | `1cm` all sides | Page margins |
| *(+ all PDF options above)* | | | |

Supports GitHub Flavored Markdown: tables, task lists (`- [x]`), strikethrough (`~~text~~`), fenced code blocks with syntax highlighting (JavaScript, TypeScript, Python, Go, Rust, SQL, and more).

### `POST /api/v1/docx-to-pdf`

Generate a PDF from a DOCX file upload.

**Request** (`multipart/form-data`):

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | `.docx` file (max 5 MB) |
| `format` | string | Page format (optional, default `A4`) |
| `landscape` | string | `"true"` or `"false"` (optional) |

```bash
curl -X POST http://localhost:3000/api/v1/docx-to-pdf \
  -F "file=@document.docx" \
  -F "format=A4" \
  --output document.pdf
```

### Response (all endpoints)

- `200` — PDF binary (`Content-Type: application/pdf`, `X-Generation-Time` header)
- `400` — Validation error (missing/invalid fields)
- `408` — Render timeout
- `413` — Content exceeds size limit
- `429` — Rate limited
- `503` — At capacity (includes `Retry-After` header)

### `GET /health`

```json
{
  "status": "healthy",
  "timestamp": "2026-03-27T10:00:00.000Z",
  "uptime": 3600,
  "browser": { "connected": true, "activePages": 0 },
  "memory": { "heapUsedMB": 45, "rssMB": 120 }
}
```

### `GET /`

Returns service name, version, and available endpoints.

## Examples

### Simple styled HTML

```bash
curl -X POST http://localhost:3000/api/v1/html-to-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><head><style>body{font-family:sans-serif;padding:2rem}h1{color:#2563eb}</style></head><body><h1>Invoice #1234</h1><p>Amount: $500.00</p></body></html>",
    "format": "Letter"
  }' --output invoice.pdf
```

### Markdown with tables and code

```bash
curl -X POST http://localhost:3000/api/v1/md-to-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Project Report\n\n| Module | Status |\n|--------|--------|\n| Auth | Live |\n| API | Active |\n\n```typescript\ninterface Config {\n  port: number;\n  env: string;\n}\n```\n\n- [x] Design done\n- [ ] Deploy"
  }' --output report-md.pdf
```

### Chart.js + QR code from CDN

```bash
curl -X POST http://localhost:3000/api/v1/html-to-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><head><script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js\"></script></head><body><canvas id=\"c\"></canvas><div id=\"qr\"></div><script>new Chart(document.getElementById(\"c\"),{type:\"bar\",data:{labels:[\"A\",\"B\",\"C\"],datasets:[{data:[10,20,15]}]},options:{animation:false}});new QRCode(document.getElementById(\"qr\"),{text:\"https://example.com\",width:128,height:128});</script></body></html>",
    "waitForTimeout": 2000
  }' --output chart.pdf
```

### DOCX file to PDF

```bash
curl -X POST http://localhost:3000/api/v1/docx-to-pdf \
  -F "file=@document.docx" \
  -F "format=A4" \
  --output document.pdf
```

## Configuration

All settings are configured via environment variables.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | `production` enables JSON logging |
| `PDF_TIMEOUT` | `10000` | PDF generation timeout (ms) |
| `MAX_HTML_SIZE` | `2097152` | Max HTML body size in bytes (2 MB) |
| `DEFAULT_FORMAT` | `A4` | Default page format |
| `MAX_CONCURRENT_PAGES` | `2` | Max simultaneous browser pages |
| `RATE_LIMIT_WINDOW` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `10` | Max requests per window per IP |
| `JS_EXECUTION_TIMEOUT` | `5000` | Timeout for `waitForSelector` (ms) |
| `ALLOWED_CDN_DOMAINS` | — | Extra CDN domains (comma-separated) |

**Default trusted CDN domains** (always included):

- `cdn.jsdelivr.net`
- `cdnjs.cloudflare.com`
- `unpkg.com`
- `fonts.googleapis.com`
- `fonts.gstatic.com`
- `cdn.tailwindcss.com`

Add more via `ALLOWED_CDN_DOMAINS=kit.fontawesome.com,stackpath.bootstrapcdn.com`.

## Security Architecture

Every PDF request passes through 3 independent security layers:

```
HTML Input
  │
  ├─ Layer 1: DOMPurify Sanitization
  │   ├── Strips: event handlers (onclick, onerror, ...), javascript: URLs
  │   ├── Strips: <iframe>, <object>, <embed>, <applet>, <form>
  │   └── Preserves: <script>, <style>, <link>, SVG, canvas, data-* attrs
  │
  ├─ Layer 2: Runtime API Overrides (evaluateOnNewDocument)
  │   ├── Blocks: fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon
  │   ├── Blocks: eval, document.cookie, localStorage, sessionStorage
  │   ├── Blocks: window.open
  │   └── Preserves: DOM APIs, Canvas, setTimeout, Promise, Math, Date
  │
  └─ Layer 3: Network Interception (Chromium DevTools Protocol)
      ├── Allows: data: and blob: URIs
      ├── Allows: images from any HTTPS host
      ├── Allows: scripts/styles/fonts from trusted CDN domains only
      ├── Blocks: all other network requests (XHR, fetch, WebSocket, etc.)
      └── URL length cap: 2048 chars (anti-exfiltration)
```

Even if a malicious script bypasses Layer 1, Layer 2 disables dangerous APIs and Layer 3 blocks all unauthorized network traffic at the browser level.

## Deployment

### Vercel (Recommended)

The project includes `vercel.json` for deployment on Vercel. It uses `@sparticuz/chromium` (a lightweight Chromium binary optimized for serverless) instead of the full Puppeteer-bundled Chrome.

**One-click deploy:**

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Vercel auto-detects the config from `vercel.json` — no settings to change
4. Click **Deploy**

**Or via CLI:**

```bash
npm i -g vercel
vercel
```

**Environment variables** (set in Vercel dashboard under Settings > Environment Variables):

| Variable | Value | Required |
|----------|-------|----------|
| `PUPPETEER_SKIP_DOWNLOAD` | `true` | Yes (already in vercel.json) |
| `MAX_CONCURRENT_PAGES` | `1` | Recommended for serverless |
| `RATE_LIMIT_MAX` | `10` | Optional |

**Vercel free tier limits:**

| Resource | Limit |
|----------|-------|
| Function duration | 60 seconds |
| Memory | 1024 MB |
| Deployment size | 250 MB |

**How it works:** On Vercel, the Express app runs as a serverless function via `api/index.ts`. The browser launches on the first request (cold start ~3-5s) and is reused for subsequent warm requests. `@sparticuz/chromium` provides a ~50 MB Chromium binary purpose-built for AWS Lambda (which Vercel uses under the hood).

**Note:** Complex PDFs with multiple CDN scripts may take 5-10s on cold start. For best results, pass `"waitForTimeout": 2000` when using CDN libraries like Chart.js or QRCode.js.

---

### Render

The project also includes `render.yaml` for deployment on Render's free tier (512 MB RAM, persistent server).

```yaml
services:
  - type: web
    name: pdf-lagbe
    runtime: node
    plan: free
    buildCommand: chmod +x render-build.sh && ./render-build.sh
    startCommand: node dist/index.js
    healthCheckPath: /health
```

**Important:** `PUPPETEER_CACHE_DIR` must point inside the project directory (`/opt/render/project/src/.puppeteer`). The default Puppeteer cache path (`/opt/render/.cache/`) is not available at runtime on Render.

**Memory budget (512 MB free tier):**

```
512 MB total
├── OS + Node.js         ~60 MB
├── Chromium             ~150 MB
├── 2 concurrent pages   ~100 MB
├── Safety margin        ~50 MB
└── Remaining            ~150 MB headroom
```

### Vercel vs Render

| | Vercel (Serverless) | Render (Persistent Server) |
|---|---|---|
| Cold start | ~3-5s per cold invocation | Only on first request after deploy |
| Concurrency | Auto-scales, 1 page per function | Fixed 2 concurrent pages |
| Timeout | 60s (free), 300s (Pro) | 30s default |
| Sleep | Functions sleep between requests | Spins down after 15 min idle |
| Best for | Low traffic, bursty workloads | Steady traffic, faster responses |

## Development

### Scripts

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Compile TypeScript to dist/
npm start          # Run production build
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run typecheck  # Type-check without emitting
```

### Project Structure

```
src/
├── index.ts                     # Entry point, graceful shutdown
├── app.ts                       # Express app, middleware, routes
├── config/index.ts              # Environment-based configuration
├── controllers/
│   ├── pdf.controller.ts        # POST /api/v1/pdf
│   └── health.controller.ts     # GET /health
├── services/
│   ├── browser.service.ts       # Puppeteer browser singleton + page pool
│   ├── pdf.service.ts           # PDF generation orchestration
│   └── sanitizer.service.ts     # DOMPurify HTML sanitization
├── security/
│   ├── policies.ts              # DOMPurify config, CDN domain list
│   └── sandbox.ts               # Runtime API overrides + network interception
├── middleware/
│   ├── error-handler.ts         # Global error handler
│   ├── rate-limiter.ts          # express-rate-limit config
│   ├── request-validator.ts     # Zod request schema
│   └── request-logger.ts        # Pino request logging
├── types/index.ts               # Shared TypeScript interfaces
└── utils/
    ├── errors.ts                # Custom error classes
    └── logger.ts                # Pino logger setup
```

### Testing

Tests use **Vitest** + **Supertest** with real Puppeteer (no mocks).

```
tests/
├── unit/                        # Sanitizer tests
│   └── sanitizer.service.test.ts
├── integration/                 # Full API endpoint tests
│   └── pdf.controller.test.ts
└── fixtures/                    # HTML test vectors
    ├── valid-html.ts            # Simple, styled, JS, canvas, CDN, SVG
    └── malicious-html.ts        # XSS: event handlers, fetch, eval, WebSocket, exfiltration
```

Integration tests spin up a real browser — first run takes ~3-5s for cold start. Timeout is set to 30s.

## Tech Stack

| Package | Purpose |
|---------|---------|
| Express 4 | HTTP server and routing |
| Puppeteer 24 | Headless Chrome for HTML-to-PDF |
| @sparticuz/chromium | Serverless-optimized Chromium for Vercel |
| Marked + marked-highlight | Markdown-to-HTML with GFM support |
| highlight.js | Syntax highlighting for code blocks |
| Mammoth | DOCX-to-HTML conversion |
| Multer | File upload handling (DOCX endpoint) |
| DOMPurify 3 | HTML sanitization (XSS prevention) |
| jsdom 25 | Server-side DOM for DOMPurify |
| Zod 3 | Request validation with TypeScript inference |
| Helmet 8 | Security headers |
| Pino 9 | Structured JSON logging |
| express-rate-limit 7 | Per-IP rate limiting |
| Vitest 3 + Supertest 7 | Testing |
| TypeScript 5 | Type safety |

## License

MIT
