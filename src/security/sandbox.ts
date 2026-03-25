import type { Page } from 'puppeteer';
import { logger } from '../utils/logger.js';

/**
 * Applies a security sandbox to a Puppeteer page:
 * 1. Blocks ALL external network requests (strongest layer)
 * 2. Overrides dangerous browser APIs before any page JS runs
 */
export async function applySandbox(page: Page): Promise<void> {
  // --- Layer 1: Network isolation via request interception ---
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

    // Block everything else — no external requests can leave
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

    // -- Block dynamic external script loading --

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName: string, options?: ElementCreationOptions) {
      const el = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'script') {
        Object.defineProperty(el, 'src', {
          set: () => { /* silently ignore — network interception blocks it anyway */ },
          get: () => '',
        });
      }
      return el;
    };
  });
}
