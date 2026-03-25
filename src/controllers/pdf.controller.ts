import type { Request, Response, NextFunction } from 'express';
import { pdfRequestSchema } from '../middleware/request-validator.js';
import { pdfService } from '../services/pdf.service.js';

export async function generatePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = pdfRequestSchema.parse(req.body);

    const result = await pdfService.generate(validated);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': result.buffer.length.toString(),
      'Content-Disposition': 'attachment; filename="document.pdf"',
      'X-Generation-Time': result.generationTimeMs.toString(),
      'Cache-Control': 'no-store',
    });

    res.status(200).send(result.buffer);
  } catch (err) {
    next(err);
  }
}
