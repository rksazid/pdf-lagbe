import * as pinoPkg from 'pino';
import { config } from '../config/index.js';

const pino = (pinoPkg as any).default ?? pinoPkg;

export const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  ...(config.nodeEnv !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});
