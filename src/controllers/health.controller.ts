import type { Request, Response } from 'express';
import { browserService } from '../services/browser.service.js';

export function healthCheck(_req: Request, res: Response): void {
  const connected = browserService.isConnected();
  const memoryUsage = process.memoryUsage();

  // Always return 200 — the server is healthy as long as it's running.
  // Browser launches lazily on first PDF request; not being connected yet is normal.
  const status = connected ? 'healthy' : 'idle';

  res.status(200).json({
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
