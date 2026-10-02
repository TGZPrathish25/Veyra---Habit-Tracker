/** Verifies Firebase ID token and attaches user data to req.user. */
import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyFirebaseToken } from '../config/firebase.js';
import { usersRepository } from '../modules/users/users.repository.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token is missing');
    }

    const decoded = await verifyFirebaseToken(token);
    req.firebaseUid = decoded.uid;

    // Look up or auto-provision user in repository
    let user = await usersRepository.findByFirebaseUid(decoded.uid);

    if (!user && decoded.email) {
      const baseUsername = decoded.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${baseUsername}_${uniqueSuffix}`;

      user = await usersRepository.createUser({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || baseUsername,
        username,
        avatarUrl: decoded.picture || null,
        timezone: 'UTC',
      });
    }

    if (!user) {
      throw new UnauthorizedError('User could not be found or provisioned');
    }

    req.user = {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      username: user.username,
      name: user.name,
      timezone: user.timezone,
      xp: user.xp,
      level: user.level,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      const msg = error instanceof Error ? error.message : 'Authentication failed';
      next(new UnauthorizedError(msg));
    }
  }
};
