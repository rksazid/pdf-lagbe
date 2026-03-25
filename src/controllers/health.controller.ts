import type { Request, Response } from 'express';
import { browserService } from '../services/browser.service.js';

export function healthCheck(_req: Request, res: Response): void {
  const connected = browserService.isConnected();
  const memoryUsage = process.memoryUsage();

  const status = connected ? 'healthy' : 'degraded';
  const httpStatus = connected ? 200 : 503;

  res.status(httpStatus).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    browser: {
      connected,
      activePages: browserService.getActivePageCount(),
    },
    memory: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
    },
  });
}
