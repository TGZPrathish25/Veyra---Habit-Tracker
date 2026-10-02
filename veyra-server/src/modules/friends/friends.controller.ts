/** Friends & privacy level progress controller. */
import type { Request, Response, NextFunction } from 'express';
import { friendsService } from './friends.service.js';
import {
  sendFriendRequestSchema,
  respondFriendRequestSchema,
  setPrivacyLevelSchema,
} from './friends.validators.js';

export class FriendsController {
  async listFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const friends = await friendsService.listFriends(req.user!.id);
      res.json({
        status: 'success',
        data: friends,
      });
    } catch (error) {
      next(error);
    }
  }

  async listRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await friendsService.listRequests(req.user!.id);
      res.json({
        status: 'success',
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = sendFriendRequestSchema.parse(req.body);
      const request = await friendsService.sendFriendRequest(req.user!.id, input);
      res.status(201).json({
        status: 'success',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async respondRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.params.requestId as string;
      const { action } = respondFriendRequestSchema.parse(req.body);
      const result = await friendsService.respondToRequest(requestId, action, req.user!.id);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrivacy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const friendId = req.params.friendId as string;
      const { privacyLevel } = setPrivacyLevelSchema.parse(req.body);
      const updated = await friendsService.setPrivacyLevel(req.user!.id, friendId, privacyLevel);
      res.json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFriend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const friendId = req.params.friendId as string;
      const result = await friendsService.removeFriend(req.user!.id, friendId);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFriendProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const friendId = req.params.friendId as string;
      const progress = await friendsService.getFriendProgress(req.user!.id, friendId);
      res.json({
        status: 'success',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feed = await friendsService.getActivityFeed(req.user!.id);
      res.json({
        status: 'success',
        data: feed,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const friendsController = new FriendsController();
