import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ChatService from '../services/chat.service';

class ChatController {
  /**
   * GET /conversations — List all conversations with last message preview
   */
  async getConversations(req: AuthRequest, res: Response) {
    try {
      const conversations = await ChatService.getRecentConversations(req.user!.id);
      return res.json({ success: true, data: { conversations } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /messages/:friendId — Get message history with a specific friend
   */
  async getMessages(req: AuthRequest, res: Response) {
    try {
      const { friendId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await ChatService.getConversation(req.user!.id, friendId, limit, offset);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /messages/:friendId — Send a message (REST fallback for non-Socket.IO clients)
   */
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { friendId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'Message content is required' });
      }

      const message = await ChatService.saveMessage(req.user!.id, friendId, content);
      return res.status(201).json({ success: true, data: { message } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /messages/:friendId/read — Mark all messages from a friend as read
   */
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { friendId } = req.params;
      await ChatService.markMessagesAsRead(req.user!.id, friendId);
      return res.json({ success: true, data: { message: 'Messages marked as read' } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ChatController();
