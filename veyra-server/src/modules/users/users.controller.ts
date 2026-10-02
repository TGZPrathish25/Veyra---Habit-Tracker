/** User profile, username availability, settings — request parsing and response formatting. */
import type { Request, Response } from 'express';
import { usersService } from './users.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

export const usersController = {
  getMe: async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const result = await usersService.getMe(req.user.id);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  },

  updateMe: async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const updated = await usersService.updateMe(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: updated,
    });
  },

  getSettings: async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const settings = await usersService.getSettings(req.user.id);
    res.status(200).json({
      status: 'success',
      data: settings,
    });
  },

  updateSettings: async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const updated = await usersService.updateSettings(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: updated,
    });
  },

  checkUsername: async (req: Request, res: Response): Promise<void> => {
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
    const result = await usersService.isUsernameAvailable(username, req.user?.id);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  },
};
