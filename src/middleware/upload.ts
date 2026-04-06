import * as multerPkg from 'multer';

const multer = (multerPkg as any).default ?? multerPkg;

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype === DOCX_MIME) {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are accepted'));
    }
  },
});
