import { z } from 'zod';

const marginSchema = z
  .object({
    top: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    left: z.string().optional(),
  })
  .optional();

export const pdfRequestSchema = z.object({
  html: z
    .string({ required_error: 'html field is required' })
    .min(1, 'HTML content cannot be empty')
    .max(2_097_152, 'HTML content exceeds 2MB limit'),

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
});

export type PdfRequest = z.infer<typeof pdfRequestSchema>;
