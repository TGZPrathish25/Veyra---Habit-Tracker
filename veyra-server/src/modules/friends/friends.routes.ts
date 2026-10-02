/** Friends and privacy-filtered routes. */
import { Router } from 'express';
import { friendsController } from './friends.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const friendsRouter = Router();

friendsRouter.use(authenticate);

// Friends listing & feed
friendsRouter.get('/', (req, res, next) => friendsController.listFriends(req, res, next));
friendsRouter.get('/feed', (req, res, next) => friendsController.getFeed(req, res, next));

// Requests
friendsRouter.get('/requests', (req, res, next) => friendsController.listRequests(req, res, next));
friendsRouter.post('/requests', (req, res, next) => friendsController.sendRequest(req, res, next));
friendsRouter.post('/requests/:requestId/respond', (req, res, next) =>
  friendsController.respondRequest(req, res, next)
);

// Individual friend actions
friendsRouter.get('/:friendId/progress', (req, res, next) =>
  friendsController.getFriendProgress(req, res, next)
);
friendsRouter.patch('/:friendId/privacy', (req, res, next) =>
  friendsController.updatePrivacy(req, res, next)
);
friendsRouter.delete('/:friendId', (req, res, next) =>
  friendsController.removeFriend(req, res, next)
);
