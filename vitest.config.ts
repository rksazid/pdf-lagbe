import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      RATE_LIMIT_MAX: '100',
    },
  },
});
