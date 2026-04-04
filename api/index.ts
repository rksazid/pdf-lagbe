// Vercel serverless entry point — exposes the Express app as a serverless function.
// Vercel routes all requests here via the rewrites in vercel.json.
import { app } from '../src/app.js';

export default app;
