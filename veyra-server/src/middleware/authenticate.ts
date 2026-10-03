import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyFirebaseToken } from '../config/firebase.js';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../lib/session.js';
import { usersRepository } from '../modules/users/users.repository.js';
import { DEFAULT_TIMEZONE } from '../lib/time.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Check persistent session cookie if header is not present
    if (!token && req.cookies) {
      token = req.cookies[SESSION_COOKIE_NAME] || req.signedCookies?.[SESSION_COOKIE_NAME];
    }

    if (!token) {
      throw new UnauthorizedError('Missing authentication credentials');
    }

    // A. Check if it's a 30-day persistent session token
    const session = verifySessionToken(token);
    if (session) {
      let user = await usersRepository.findById(session.userId);
      if (!user) {
        user = await usersRepository.findByFirebaseUid(session.firebaseUid);
      }
      if (!user) {
        throw new UnauthorizedError('User session expired or user not found');
      }

      req.firebaseUid = user.firebaseUid;
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

      return next();
    }

    // B. Otherwise, verify as Firebase ID token or dev token
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
        timezone: DEFAULT_TIMEZONE,
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
