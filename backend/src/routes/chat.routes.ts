import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import ChatController from '../controllers/chat.controller';

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware as any);

router.get('/conversations', ChatController.getConversations);
router.get('/messages/:friendId', ChatController.getMessages);
router.post('/messages/:friendId', ChatController.sendMessage);
router.post('/messages/:friendId/read', ChatController.markAsRead);

export default router;
