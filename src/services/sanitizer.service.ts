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

    // DOMPurify strips <script> tags whose body contains HTML-like strings
    // (e.g. innerHTML += "<tr><td>...") as an mXSS protection.  We need those
    // inline scripts to execute (Chart.js, QRCode.js, DOM builders).  Security
    // is enforced by the runtime sandbox (Layer 2 + 3), not by stripping scripts.
    //
    // Strategy: extract inline script bodies → sanitize HTML → reinsert bodies.
    const scriptBodies: string[] = [];
    const htmlWithPlaceholders = html.replace(
      /<script([^>]*)>([\s\S]*?)<\/script>/gi,
      (_match, attrs: string, body: string) => {
        if (!body.trim()) return _match; // empty body (e.g. <script src="..."></script>)
        const idx = scriptBodies.length;
        scriptBodies.push(body);
        return `<script${attrs}>/*__SCRIPT_${idx}__*/</script>`;
      },
    );

    // DOMPurify sanitization: strips XSS vectors (event handlers, iframes, etc.)
    const clean = this.purify.sanitize(htmlWithPlaceholders, {
      ...DOMPURIFY_CONFIG,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    }) as string;

    // Restore inline script bodies
    let result = clean;
    for (let i = 0; i < scriptBodies.length; i++) {
      result = result.replace(`/*__SCRIPT_${i}__*/`, scriptBodies[i]);
    }

    return result;
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
