import type { Browser, Page } from 'puppeteer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ServiceUnavailableError } from '../utils/errors.js';

const isVercel = !!process.env.VERCEL;

const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--disable-translate',
  '--no-first-run',
  '--disable-background-timer-throttling',
  '--js-flags=--max-old-space-size=256',
];

class BrowserService {
  private browser: Browser | null = null;
  private activePages = 0;
  private launching = false;
  private launchPromise: Promise<Browser> | null = null;

  async ensureBrowser(): Promise<Browser> {
    if (this.browser?.connected) {
      return this.browser;
    }

    // Prevent concurrent launches
    if (this.launching && this.launchPromise) {
      return this.launchPromise;
    }

    this.launching = true;
    this.launchPromise = this.launch();

    try {
      this.browser = await this.launchPromise;
      return this.browser;
    } finally {
      this.launching = false;
      this.launchPromise = null;
    }
  }

  private async launch(): Promise<Browser> {
    logger.info({ isVercel }, 'Launching Chromium...');

    let browser: Browser;

    if (isVercel) {
      // Vercel serverless: use @sparticuz/chromium (lightweight binary for Lambda)
      const chromium = (await import('@sparticuz/chromium')).default;
      const puppeteerCore = (await import('puppeteer-core')).default;
      browser = await puppeteerCore.launch({
        args: [...chromium.args, ...LAUNCH_ARGS],
        executablePath: await chromium.executablePath(),
        headless: true,
      }) as unknown as Browser;
    } else {
      // Render / local dev: use full puppeteer with bundled Chrome
      const puppeteer = (await import('puppeteer')).default;
      browser = await puppeteer.launch({
        headless: true,
        args: LAUNCH_ARGS,
      });
    }

    browser.on('disconnected', () => {
      logger.warn('Browser disconnected');
      this.browser = null;
      this.activePages = 0;
    });

    logger.info('Chromium launched successfully');
    return browser;
  }

  async getPage(): Promise<Page> {
    if (this.activePages >= config.maxConcurrentPages) {
      throw new ServiceUnavailableError(5);
    }

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();
    this.activePages++;

    logger.debug({ activePages: this.activePages }, 'Page created');
    return page;
  }

  async releasePage(page: Page): Promise<void> {
    try {
      if (!page.isClosed()) {
        await page.close();
      }
    } catch (err) {
      logger.warn({ err }, 'Error closing page');
    } finally {
      this.activePages = Math.max(0, this.activePages - 1);
      logger.debug({ activePages: this.activePages }, 'Page released');
    }
  }

  isConnected(): boolean {
    return this.browser?.connected ?? false;
  }

  getActivePageCount(): number {
    return this.activePages;
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      logger.info('Shutting down Chromium...');
      try {
        await this.browser.close();
      } catch (err) {
        logger.warn({ err }, 'Error during browser shutdown');
      }
      this.browser = null;
      this.activePages = 0;
      logger.info('Chromium shut down');
    }
  }
}

export const browserService = new BrowserService();
