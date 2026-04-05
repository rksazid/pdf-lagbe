// Vercel serverless entry point.
// Plain JS (not TS) so Vercel's @vercel/node builder doesn't recompile or
// trace source maps back into src/. The buildCommand runs `tsc` first,
// so dist/ is available at this point.
import { app } from '../dist/app.js';

export default app;
