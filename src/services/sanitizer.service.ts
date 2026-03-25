import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { DOMPURIFY_CONFIG, SUSPICIOUS_PATTERNS } from '../security/policies.js';
import { logger } from '../utils/logger.js';

class SanitizerService {
  private purify: ReturnType<typeof DOMPurify>;

  constructor() {
    // Create a jsdom window for server-side DOMPurify
    const { window } = new JSDOM('');
    this.purify = DOMPurify(window as any);
  }

  sanitize(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Static analysis: log suspicious patterns (defense in depth, not blocking)
    this.logSuspiciousPatterns(html);

    // DOMPurify sanitization: strips XSS vectors, preserves script/style tags
    const clean = this.purify.sanitize(html, {
      ...DOMPURIFY_CONFIG,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    });

    return clean as string;
  }

  private logSuspiciousPatterns(html: string): void {
    const matches: string[] = [];

    for (const pattern of SUSPICIOUS_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(html)) {
        matches.push(pattern.source);
      }
    }

    if (matches.length > 0) {
      logger.warn(
        { patterns: matches },
        'Suspicious patterns detected in HTML input (runtime sandbox will enforce)',
      );
    }
  }
}

export const sanitizerService = new SanitizerService();
