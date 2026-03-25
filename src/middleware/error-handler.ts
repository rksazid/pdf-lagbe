import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ServiceUnavailableError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Puppeteer timeout errors
  if (err.name === 'TimeoutError') {
    res.status(408).json({
      error: 'RENDER_TIMEOUT',
      message: 'PDF rendering timed out. Reduce HTML complexity or increase timeout.',
    });
    return;
  }

  // Custom app errors
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      error: err.code,
      message: err.message,
    };

    if (err instanceof ServiceUnavailableError) {
      res.set('Retry-After', err.retryAfter.toString());
    }

    if (err instanceof ValidationError && err.details) {
      body.details = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Unexpected errors — log full details, return generic message
  logger.error({ err }, 'Unexpected error');

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
