import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import FriendsController from '../controllers/friends.controller';

const router = express.Router();

// All friend routes require authentication
router.use(authMiddleware as any);

router.post('/request', FriendsController.sendRequest);
router.post('/accept/:requestId', FriendsController.acceptRequest);
router.post('/reject/:requestId', FriendsController.rejectRequest);
router.delete('/:friendId', FriendsController.removeFriend);
router.get('/connections', FriendsController.getConnections);
router.get('/pending', FriendsController.getPending);
router.get('/sent', FriendsController.getSent);
router.get('/status/:userId', FriendsController.getStatus);

export default router;
