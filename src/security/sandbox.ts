import type { Page } from 'puppeteer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Pre-compute a Set for O(1) domain lookups
const allowedDomains = new Set(config.allowedCdnDomains);

// Resource types permitted from CDN domains
const CDN_RESOURCE_TYPES = new Set(['stylesheet', 'script', 'font']);

// Cap URL length to limit data exfiltration via query strings
const MAX_URL_LENGTH = 2048;

function isAllowedRequest(url: string, resourceType: string): boolean {
  if (url.length > MAX_URL_LENGTH) {
    logger.warn({ url: url.substring(0, 200) }, 'Blocked request: URL too long');
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') {
    return false;
  }

  // Images allowed from any HTTPS host (clients embed their own server URLs)
  if (resourceType === 'image') {
    return true;
  }

  // Scripts, stylesheets, fonts only from trusted CDN domains
  if (CDN_RESOURCE_TYPES.has(resourceType)) {
    return allowedDomains.has(parsed.hostname);
  }

  return false;
}

/**
 * Applies a security sandbox to a Puppeteer page:
 * 1. Allows trusted CDN domains; blocks all other external requests
 * 2. Overrides dangerous browser APIs before any page JS runs
 */
export async function applySandbox(page: Page): Promise<void> {
  // --- Layer 1: Network interception with CDN allowlist ---
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url();

    // Allow data: URIs (inline images, fonts encoded as base64)
    if (url.startsWith('data:')) {
      request.continue();
      return;
    }

    // Allow blob: URIs (canvas toBlob, object URLs)
    if (url.startsWith('blob:')) {
      request.continue();
      return;
    }

    // Allow images from any HTTPS host; scripts/styles/fonts from CDN domains
    if (isAllowedRequest(url, request.resourceType())) {
      logger.debug({ url, type: request.resourceType() }, 'Allowed external request');
      request.continue();
      return;
    }

    // Block everything else
    logger.debug({ url, type: request.resourceType() }, 'Blocked network request');
    request.abort('blockedbyclient');
  });

  // --- Layer 2: Runtime API overrides (runs before any page JS) ---
  await page.evaluateOnNewDocument(() => {
    // -- Block data exfiltration --

    Object.defineProperty(window, 'fetch', {
      value: () => Promise.reject(new Error('fetch is disabled in PDF rendering')),
      writable: false,
      configurable: false,
    });

    Object.defineProperty(window, 'XMLHttpRequest', {
      value: class {
        open() { throw new Error('XMLHttpRequest is disabled'); }
        send() { throw new Error('XMLHttpRequest is disabled'); }
        addEventListener() {}
        setRequestHeader() {}
      },
      writable: false,
      configurable: false,
    });

    Object.defineProperty(navigator, 'sendBeacon', {
      value: () => false,
      writable: false,
      configurable: false,
    });

    Object.defineProperty(window, 'WebSocket', {
      value: class {
        constructor() { throw new Error('WebSocket is disabled'); }
      },
      writable: false,
      configurable: false,
    });

    Object.defineProperty(window, 'EventSource', {
      value: class {
        constructor() { throw new Error('EventSource is disabled'); }
      },
      writable: false,
      configurable: false,
    });

    // -- Block code injection --

    Object.defineProperty(window, 'eval', {
      value: () => { throw new Error('eval is disabled'); },
      writable: false,
      configurable: false,
    });

    // -- Block storage & cookies --

    Object.defineProperty(document, 'cookie', {
      get: () => '',
      set: () => {},
      configurable: false,
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      writable: false,
      configurable: false,
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      writable: false,
      configurable: false,
    });

    // -- Block navigation --

    Object.defineProperty(window, 'open', {
      value: () => null,
      writable: false,
      configurable: false,
    });
  });
}
