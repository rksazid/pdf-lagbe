export interface PdfGenerationOptions {
  html: string;
  format?: 'A4' | 'Letter' | 'A3' | 'Legal' | 'Tabloid';
  landscape?: boolean;
  margin?: PdfMargin;
  printBackground?: boolean;
  scale?: number;
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  preferCSSPageSize?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
}

export interface PdfMargin {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface PdfResult {
  buffer: Buffer;
  generationTimeMs: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  browser: {
    connected: boolean;
    activePages: number;
  };
  memory: {
    heapUsedMB: number;
    rssMB: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}
