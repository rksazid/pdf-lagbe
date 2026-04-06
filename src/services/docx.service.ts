import * as mammothPkg from 'mammoth';
import { logger } from '../utils/logger.js';

const mammoth = (mammothPkg as any).default ?? mammothPkg;

const DOCX_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #24292f;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
img { max-width: 100%; height: auto; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; }
th, td { padding: 6px 13px; border: 1px solid #d1d9e0; }
th { font-weight: 600; background-color: #f6f8fa; }
p { margin: 0 0 0.8em; }
h1, h2, h3, h4, h5, h6 { margin-top: 1.2em; margin-bottom: 0.4em; font-weight: 600; }
`;

class DocxService {
  async toHtml(buffer: Buffer): Promise<string> {
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement((image: any) =>
          image.read('base64').then((data: string) => ({
            src: `data:${image.contentType};base64,${data}`,
          })),
        ),
      },
    );

    if (result.messages.length > 0) {
      logger.debug({ messages: result.messages }, 'DOCX conversion warnings');
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${DOCX_CSS}</style>
</head>
<body>
${result.value}
</body>
</html>`;
  }
}

export const docxService = new DocxService();
