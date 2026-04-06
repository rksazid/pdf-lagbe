import * as multerPkg from 'multer';

const multer = (multerPkg as any).default ?? multerPkg;

const DOCX_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
  'application/zip',
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req: any, file: any, cb: any) => {
    const hasDocxExt = file.originalname.toLowerCase().endsWith('.docx');
    if (DOCX_MIMES.has(file.mimetype) || hasDocxExt) {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are accepted'));
    }
  },
});
