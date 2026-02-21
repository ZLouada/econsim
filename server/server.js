import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Validate required environment variables at startup
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

import calculateRouter from './routes/calculate.js';
import scenariosRouter from './routes/scenarios.js';
import usersRouter from './routes/users.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/calculate', calculateRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/users', usersRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found.' }));

// ─── Error handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`EconSim server running on port ${PORT}`);
});

export default app;
