import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { browserService } from './services/browser.service.js';

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'pdf-lagbe server started');
  logger.info('Browser will launch lazily on first PDF request');
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');

  server.close(async () => {
    logger.info('HTTP server closed');
    await browserService.shutdown();
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown stalls
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  process.exit(1);
});
