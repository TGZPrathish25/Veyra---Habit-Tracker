/** Socket.IO setup with CORS and Firebase token handshake auth. */
import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let io: Server;

export function setupSocketIO(httpServer: HttpServer): Server {
  const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      credentials: true,
    },
    // EXTENSION POINT: Redis adapter for multi-instance scaling
    // To scale to multiple instances:
    // 1. npm install @socket.io/redis-adapter redis
    // 2. import { createAdapter } from '@socket.io/redis-adapter'
    // 3. const pubClient = createClient({ url: REDIS_URL })
    // 4. io.adapter(createAdapter(pubClient, pubClient.duplicate()))
    // 5. Enable sticky sessions on load balancer
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      // TODO: Verify Firebase token and attach user data to socket
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
