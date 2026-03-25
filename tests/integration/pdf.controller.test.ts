import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { browserService } from '../../src/services/browser.service.js';
import * as valid from '../fixtures/valid-html.js';
import * as malicious from '../fixtures/malicious-html.js';

// PDF magic bytes: %PDF-
const PDF_MAGIC = Buffer.from('%PDF-');

afterAll(async () => {
  await browserService.shutdown();
});

describe('GET /', () => {
  it('returns service info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('pdf-lagbe');
  });
});

describe('GET /health', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('browser');
    expect(res.body).toHaveProperty('memory');
  });
});

describe('POST /api/v1/pdf', () => {
  it('generates PDF from simple HTML', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: valid.simpleDocument() })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('generates PDF with CSS styles', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: valid.styledDocument() })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('generates PDF with JS-modified DOM', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: valid.jsDocument(), waitForTimeout: 500 })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('generates PDF with canvas chart', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: valid.canvasDocument(), waitForTimeout: 500 })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('handles XSS in event handler without crashing', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: malicious.xssEventHandler() })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('handles fetch exfiltration attempt without crashing', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: malicious.xssFetch(), waitForTimeout: 500 })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('handles eval attempt without crashing', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: malicious.xssEval(), waitForTimeout: 500 })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('returns 400 for missing html field', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ format: 'A4' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for empty html', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for empty body', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({});

    expect(res.status).toBe(400);
  });

  it('accepts landscape option', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: '<h1>Landscape</h1>', landscape: true })
      .timeout(30000);

    expect(res.status).toBe(200);
    expect(res.body.subarray(0, 5).toString()).toBe(PDF_MAGIC.toString());
  }, 30000);

  it('accepts Letter format', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ html: '<h1>Letter</h1>', format: 'Letter' })
      .timeout(30000);

    expect(res.status).toBe(200);
  }, 30000);
});
