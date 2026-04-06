import { describe, it, expect } from 'vitest';
import { markdownService } from '../../src/services/markdown.service.js';
import { sanitizerService } from '../../src/services/sanitizer.service.js';

describe('MarkdownService', () => {
  describe('toHtml', () => {
    it('wraps output in a complete HTML document', () => {
      const result = markdownService.toHtml('# Hello');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<style>');
      expect(result).toContain('class="markdown-body"');
    });

    it('converts headings', () => {
      const result = markdownService.toHtml('# H1\n## H2\n### H3');
      expect(result).toContain('<h1>');
      expect(result).toContain('<h2>');
      expect(result).toContain('<h3>');
    });

    it('converts bold and italic', () => {
      const result = markdownService.toHtml('**bold** and *italic*');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('converts GFM tables', () => {
      const result = markdownService.toHtml('| A | B |\n|---|---|\n| 1 | 2 |');
      expect(result).toContain('<table>');
      expect(result).toContain('<th>A</th>');
      expect(result).toContain('<td>1</td>');
    });

    it('converts task lists', () => {
      const result = markdownService.toHtml('- [x] Done\n- [ ] Pending');
      expect(result).toContain('checked');
      expect(result).toContain('type="checkbox"');
    });

    it('converts strikethrough', () => {
      const result = markdownService.toHtml('~~deleted~~');
      expect(result).toContain('<del>deleted</del>');
    });

    it('applies syntax highlighting to code blocks', () => {
      const result = markdownService.toHtml('```javascript\nconst x = 1;\n```');
      expect(result).toContain('hljs');
      expect(result).toContain('<code');
    });

    it('handles code blocks without language spec', () => {
      const result = markdownService.toHtml('```\nplain code\n```');
      expect(result).toContain('<code');
      expect(result).toContain('plain');
    });

    it('converts blockquotes', () => {
      const result = markdownService.toHtml('> quoted text');
      expect(result).toContain('<blockquote>');
    });

    it('converts links', () => {
      const result = markdownService.toHtml('[Click](https://example.com)');
      expect(result).toContain('href="https://example.com"');
    });
  });

  describe('DOMPurify compatibility', () => {
    it('produced HTML survives sanitization with key elements intact', () => {
      const html = markdownService.toHtml(
        '# Test\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = 1;\n```\n\n~~deleted~~',
      );
      const sanitized = sanitizerService.sanitize(html);
      expect(sanitized).toContain('<h1>');
      expect(sanitized).toContain('<table>');
      expect(sanitized).toContain('<code');
      expect(sanitized).toContain('<style>');
      expect(sanitized).toContain('<del>');
    });
  });
});
