/** Bootstrap: creates HTTP server, attaches Socket.IO, starts cron jobs, graceful shutdown. */
import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initFirebase } from './config/firebase.js';
import { logger } from './config/logger.js';
import { prisma, ensureDatabaseSchema } from './db/prisma.js';
import { setupSocketIO } from './sockets/index.js';
import { startScheduler } from './jobs/scheduler.js';

const server = createServer(app);

// Initialize services
initFirebase();
setupSocketIO(server);
startScheduler();

// Self-heal and synchronize schema columns (due_time, day_due_times, and performance indexes)
ensureDatabaseSchema().catch((err) => {
  logger.warn({ err }, 'Schema auto-sync error');
});

// Start listening
server.listen(env.PORT, () => {
  logger.info(`🚀 Veyra server running on port ${env.PORT} (${env.NODE_ENV})`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(() => {
    logger.info('HTTP server closed');
  });

  // TODO: Close Socket.IO, stop cron
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
