import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { UnauthorizedError } from '../../lib/errors.js';
import {
  generateSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '../../lib/session.js';
import { env } from '../../config/env.js';

export const authController = {
  sync: async (req: Request, res: Response): Promise<void> => {
    const firebaseUid = req.firebaseUid;
    if (!firebaseUid) {
      throw new UnauthorizedError('Unauthorized — missing Firebase identity');
    }

    const result = await authService.syncUser(firebaseUid, req.body);

    // Issue 30-day persistent session token
    const sessionToken = generateSessionToken({
      userId: result.user.id,
      firebaseUid: result.user.firebaseUid,
      email: result.user.email,
    }, 30);

    // Set 30-day persistent HttpOnly, Secure, SameSite=Lax cookie
    res.cookie(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    res.status(200).json({
      status: 'success',
      data: {
        ...result,
        token: sessionToken,
      },
    });
  },

  me: async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const result = await authService.getCurrentUser(req.user.id);

    // Renew 30-day persistent session token for active user
    const sessionToken = generateSessionToken({
      userId: result.user.id,
      firebaseUid: result.user.firebaseUid,
      email: result.user.email,
    }, 30);

    res.cookie(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    res.status(200).json({
      status: 'success',
      data: {
        ...result,
        token: sessionToken,
      },
    });
  },

  logout: async (_req: Request, res: Response): Promise<void> => {
    // Clear persistent session cookie
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },
};
