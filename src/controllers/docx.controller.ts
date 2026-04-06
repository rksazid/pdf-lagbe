import type { Request, Response, NextFunction } from 'express';
import { docxPdfOptionsSchema } from '../middleware/request-validator.js';
import { docxService } from '../services/docx.service.js';
import { pdfService } from '../services/pdf.service.js';
import { ValidationError } from '../utils/errors.js';

export async function generateDocxPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new ValidationError('A .docx file is required (field name: "file")');
    }

    const options = docxPdfOptionsSchema.parse(req.body);
    const html = await docxService.toHtml(req.file.buffer);

    const result = await pdfService.generate({ ...options, html });

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
