import { z } from 'zod';

const marginSchema = z
  .object({
    top: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    left: z.string().optional(),
  })
  .optional();

/** Shared PDF output options (format, margin, orientation, etc.) */
const pdfOptionsSchema = {
  format: z.enum(['A4', 'Letter', 'A3', 'Legal', 'Tabloid']).optional().default('A4'),
  landscape: z.boolean().optional().default(false),
  margin: marginSchema,
  printBackground: z.boolean().optional().default(true),
  scale: z.number().min(0.1).max(2.0).optional().default(1),
  headerTemplate: z.string().max(10_000).optional(),
  footerTemplate: z.string().max(10_000).optional(),
  displayHeaderFooter: z.boolean().optional().default(false),
  preferCSSPageSize: z.boolean().optional().default(false),
  waitForSelector: z.string().max(200).optional(),
  waitForTimeout: z.number().int().min(0).max(5000).optional(),
};

/** POST /api/v1/html-to-pdf */
export const htmlPdfRequestSchema = z.object({
  html: z
    .string({ required_error: 'html field is required' })
    .min(1, 'HTML content cannot be empty')
    .max(2_097_152, 'HTML content exceeds 2MB limit'),
  ...pdfOptionsSchema,
});

/** POST /api/v1/md-to-pdf */
export const mdPdfRequestSchema = z.object({
  markdown: z
    .string({ required_error: 'markdown field is required' })
    .min(1, 'Markdown content cannot be empty')
    .max(2_097_152, 'Markdown content exceeds 2MB limit'),
  ...pdfOptionsSchema,
});

/** POST /api/v1/docx-to-pdf — only PDF options (file comes via multer) */
export const docxPdfOptionsSchema = z.object({
  ...pdfOptionsSchema,
});

// Keep backward-compatible alias
export const pdfRequestSchema = htmlPdfRequestSchema;

export type HtmlPdfRequest = z.infer<typeof htmlPdfRequestSchema>;
export type MdPdfRequest = z.infer<typeof mdPdfRequestSchema>;
export type DocxPdfOptions = z.infer<typeof docxPdfOptionsSchema>;
export type PdfRequest = HtmlPdfRequest;
