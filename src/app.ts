import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { requestLogger } from './middleware/request-logger.js';
import { apiRateLimiter } from './middleware/rate-limiter.js';
import { errorHandler } from './middleware/error-handler.js';
import { generatePdf } from './controllers/pdf.controller.js';
import { healthCheck } from './controllers/health.controller.js';

export const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Gzip compression
app.use(compression());

// Parse JSON bodies with size limit
app.use(express.json({ limit: '2mb' }));

// Request logging
app.use(requestLogger);

// Trust proxy (Render is behind a reverse proxy)
app.set('trust proxy', 1);

// --- Routes ---

// Service info
app.get('/', (_req, res) => {
  res.json({
    service: 'pdf-lagbe',
    version: '1.0.0',
    endpoints: {
      'POST /api/v1/pdf': 'Generate PDF from HTML',
      'GET /health': 'Health check',
    },
  });
});

// Health check (no rate limit)
app.get('/health', healthCheck);

// PDF generation (rate limited)
app.post('/api/v1/pdf', apiRateLimiter, generatePdf);

// Global error handler (must be last)
app.use(errorHandler);
