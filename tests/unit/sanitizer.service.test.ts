import { describe, it, expect } from 'vitest';
import { sanitizerService } from '../../src/services/sanitizer.service.js';
import * as valid from '../fixtures/valid-html.js';
import * as malicious from '../fixtures/malicious-html.js';

describe('SanitizerService', () => {
  describe('valid HTML preservation', () => {
    it('preserves basic HTML structure', () => {
      const result = sanitizerService.sanitize(valid.simpleDocument());
      expect(result).toContain('<h1>Hello World</h1>');
      expect(result).toContain('<table>');
      expect(result).toContain('<td>Item 1</td>');
    });

    it('preserves style tags and CSS', () => {
      const result = sanitizerService.sanitize(valid.styledDocument());
      expect(result).toContain('<style>');
      expect(result).toContain('display: grid');
      expect(result).toContain('border-radius');
    });

    it('preserves script tags with DOM manipulation', () => {
      const result = sanitizerService.sanitize(valid.jsDocument());
      expect(result).toContain('<script>');
      expect(result).toContain('getElementById');
    });

    it('preserves SVG elements', () => {
      const result = sanitizerService.sanitize(valid.svgDocument());
      expect(result).toContain('<svg');
      expect(result).toContain('<circle');
      expect(result).toContain('<text');
    });

    it('preserves canvas element', () => {
      const result = sanitizerService.sanitize(valid.canvasDocument());
      expect(result).toContain('<canvas');
    });
  });

  describe('XSS stripping', () => {
    it('strips onerror event handler', () => {
      const result = sanitizerService.sanitize(malicious.xssEventHandler());
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Test</p>');
    });

    it('strips iframe tags', () => {
      const result = sanitizerService.sanitize(malicious.xssIframe());
      expect(result).not.toContain('<iframe');
      expect(result).toContain('<p>Test</p>');
    });

    it('strips javascript: protocol', () => {
      const result = sanitizerService.sanitize(malicious.xssJavascriptProtocol());
      expect(result).not.toContain('javascript:');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizerService.sanitize('')).toBe('');
    });

    it('returns empty string for null-ish input', () => {
      expect(sanitizerService.sanitize(null as any)).toBe('');
      expect(sanitizerService.sanitize(undefined as any)).toBe('');
    });

    it('handles very large input without crashing', () => {
      const largeHtml = '<p>' + 'a'.repeat(100_000) + '</p>';
      const result = sanitizerService.sanitize(largeHtml);
      expect(result).toContain('<p>');
    });
  });
});
