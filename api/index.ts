// Vercel serverless entry point — exposes the Express app as a serverless function.
// Vercel routes all requests here via the rewrites in vercel.json.
//
// Imports from dist/ (compiled JS) instead of src/ (TypeScript) because
// Vercel's serverless builder compiles api/ files with its own TS config
// that lacks esModuleInterop, breaking CJS default imports (helmet, cors).
// Vercel runs `npm run build` first, so dist/ exists when this is compiled.
import { app } from '../dist/app.js';

export default app;
