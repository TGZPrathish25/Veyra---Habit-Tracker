/** Session bootstrap, first-login user creation, token verification — request parsing and response formatting. */
import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

export const authController = {
  sync: async (req: Request, res: Response): Promise<void> => {
    const firebaseUid = req.firebaseUid;
    if (!firebaseUid) {
      throw new UnauthorizedError('Unauthorized — missing Firebase identity');
    }

    const result = await authService.syncUser(firebaseUid, req.body);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  },

  me: async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const result = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  },

  logout: async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },
};
