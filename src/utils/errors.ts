export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class HtmlTooLargeError extends AppError {
  constructor() {
    super('HTML content exceeds maximum size limit', 413, 'PAYLOAD_TOO_LARGE');
  }
}

export class RenderTimeoutError extends AppError {
  constructor() {
    super('PDF rendering timed out', 408, 'RENDER_TIMEOUT');
  }
}

export class ServiceUnavailableError extends AppError {
  public retryAfter: number;
  constructor(retryAfter: number = 5) {
    super('Service is at capacity, please retry', 503, 'SERVICE_UNAVAILABLE');
    this.retryAfter = retryAfter;
  }
}

export class RenderError extends AppError {
  constructor(message: string) {
    super(`PDF rendering failed: ${message}`, 500, 'RENDER_ERROR');
  }
}
