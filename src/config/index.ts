import { DEFAULT_ALLOWED_CDN_DOMAINS } from '../security/policies.js';

export interface Config {
  port: number;
  nodeEnv: string;
  pdfTimeout: number;
  maxHtmlSize: number;
  defaultFormat: string;
  maxConcurrentPages: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  jsExecutionTimeout: number;
  isRender: boolean;
  allowedCdnDomains: string[];
}

function parseIntEnv(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export const config: Config = {
  port: parseIntEnv('PORT', 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  pdfTimeout: parseIntEnv('PDF_TIMEOUT', 10000),
  maxHtmlSize: parseIntEnv('MAX_HTML_SIZE', 2_097_152),
  defaultFormat: process.env.DEFAULT_FORMAT || 'A4',
  maxConcurrentPages: parseIntEnv('MAX_CONCURRENT_PAGES', 2),
  rateLimitWindow: parseIntEnv('RATE_LIMIT_WINDOW', 60000),
  rateLimitMax: parseIntEnv('RATE_LIMIT_MAX', 10),
  jsExecutionTimeout: parseIntEnv('JS_EXECUTION_TIMEOUT', 5000),
  isRender: process.env.RENDER === 'true',
  allowedCdnDomains: parseAllowedDomains(),
};

function parseAllowedDomains(): string[] {
  const envDomains = process.env.ALLOWED_CDN_DOMAINS;
  const extra = envDomains
    ? envDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean)
    : [];
  return [...new Set([...DEFAULT_ALLOWED_CDN_DOMAINS, ...extra])];
}
