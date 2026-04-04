import * as rateLimitPkg from 'express-rate-limit';
import { config } from '../config/index.js';

const rateLimit = (rateLimitPkg as any).default ?? rateLimitPkg;

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
  },
});
