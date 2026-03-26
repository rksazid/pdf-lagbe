import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { RenderError, RenderTimeoutError } from '../utils/errors.js';
import { browserService } from './browser.service.js';
import { sanitizerService } from './sanitizer.service.js';
import { applySandbox } from '../security/sandbox.js';
import type { PdfGenerationOptions, PdfResult } from '../types/index.js';

class PdfService {
  async generate(options: PdfGenerationOptions): Promise<PdfResult> {
    const startTime = Date.now();

    // Step 1: Sanitize HTML
    const sanitizedHtml = sanitizerService.sanitize(options.html);

    if (!sanitizedHtml.trim()) {
      throw new RenderError('HTML content is empty after sanitization');
    }

    // Step 2: Acquire page + render PDF (all inside try-catch so browser
    // launch errors are caught and surfaced as RenderError, not generic 500)
    let page;
    try {
      page = await browserService.getPage();

      // Step 3: Apply security sandbox (network isolation + API overrides)
      await applySandbox(page);

      // Step 4: Set page content
      await page.setContent(sanitizedHtml, {
        waitUntil: 'domcontentloaded',
        timeout: config.pdfTimeout,
      });

      // Step 5: Wait for external resources (CDN scripts, images, fonts)
      // to finish loading.  Resolves instantly if there are no requests.
      // Falls back gracefully on timeout so simple HTML isn't blocked.
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {
        logger.debug('Network idle timeout — proceeding with PDF generation');
      });

      // Wait for fonts to load (base64 embedded + CDN fonts)
      await page.evaluate(() => document.fonts.ready);

      // Wait for a specific DOM element if requested
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: config.jsExecutionTimeout,
        });
      }

      // Additional wait for chart animations / dynamic rendering
      if (options.waitForTimeout) {
        const safeTimeout = Math.min(options.waitForTimeout, 5000);
        await new Promise((resolve) => setTimeout(resolve, safeTimeout));
      }

      // Step 6: Generate PDF
      const pdfBuffer = await page.pdf({
        format: (options.format || config.defaultFormat) as any,
        landscape: options.landscape ?? false,
        margin: options.margin ?? { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        printBackground: options.printBackground ?? true,
        scale: Math.min(Math.max(options.scale ?? 1, 0.1), 2.0),
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate,
        displayHeaderFooter: options.displayHeaderFooter ?? false,
        preferCSSPageSize: options.preferCSSPageSize ?? false,
        timeout: config.pdfTimeout,
      });

      const generationTimeMs = Date.now() - startTime;
      logger.info({ generationTimeMs, size: pdfBuffer.length }, 'PDF generated');

      return {
        buffer: Buffer.from(pdfBuffer),
        generationTimeMs,
      };
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        throw new RenderTimeoutError();
      }
      throw new RenderError(err.message || 'Unknown rendering error');
    } finally {
      // Always release the page, even on error
      if (page) {
        await browserService.releasePage(page);
      }
    }
  }
}

export const pdfService = new PdfService();
