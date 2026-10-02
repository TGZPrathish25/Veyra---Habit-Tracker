/** Mounts all module routers under /api/v1; provides GET /health and GET /ready. */
import type { Express } from 'express';
import { prisma } from '../db/prisma.js';

// Import module routers (stubs)
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { tasksRouter } from '../modules/tasks/tasks.routes.js';
import { weeklyRouter } from '../modules/weekly/weekly.routes.js';
import { monthlyRouter } from '../modules/monthly/monthly.routes.js';
import { deadlinesRouter } from '../modules/deadlines/deadlines.routes.js';
import { gamificationRouter } from '../modules/gamification/gamification.routes.js';
import { streaksRouter } from '../modules/streaks/streaks.routes.js';
import { friendsRouter } from '../modules/friends/friends.routes.js';
import { challengesRouter } from '../modules/challenges/challenges.routes.js';
import { leaderboardRouter } from '../modules/leaderboard/leaderboard.routes.js';
import { notificationsRouter } from '../modules/notifications/notifications.routes.js';
import { analyticsRouter } from '../modules/analytics/analytics.routes.js';
import { historyRouter } from '../modules/history/history.routes.js';
import { aiRouter } from '../modules/ai/ai.routes.js';

export function mountRoutes(app: Express): void {
  // Health checks
  const sendHealth = (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  };
  app.get('/health', sendHealth);
  app.get('/api/v1/health', sendHealth);

  app.get('/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'not ready', database: 'disconnected' });
    }
  });

  // API v1 routes
  const prefix = '/api/v1';
  app.use(`${prefix}/auth`, authRouter);
  app.use(`${prefix}/users`, usersRouter);
  app.use(`${prefix}/tasks`, tasksRouter);
  app.use(`${prefix}/weekly`, weeklyRouter);
  app.use(`${prefix}/monthly`, monthlyRouter);
  app.use(`${prefix}/deadlines`, deadlinesRouter);
  app.use(`${prefix}/gamification`, gamificationRouter);
  app.use(`${prefix}/streaks`, streaksRouter);
  app.use(`${prefix}/friends`, friendsRouter);
  app.use(`${prefix}/challenges`, challengesRouter);
  app.use(`${prefix}/leaderboard`, leaderboardRouter);
  app.use(`${prefix}/notifications`, notificationsRouter);
  app.use(`${prefix}/analytics`, analyticsRouter);
  app.use(`${prefix}/history`, historyRouter);
  app.use(`${prefix}/ai`, aiRouter);
}
