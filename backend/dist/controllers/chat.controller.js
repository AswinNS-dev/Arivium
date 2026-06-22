"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_service_1 = __importDefault(require("../services/chat.service"));
class ChatController {
    /**
     * GET /conversations — List all conversations with last message preview
     */
    async getConversations(req, res) {
        try {
            const conversations = await chat_service_1.default.getRecentConversations(req.user.id);
            return res.json({ success: true, data: { conversations } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /messages/:friendId — Get message history with a specific friend
     */
    async getMessages(req, res) {
        try {
            const { friendId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const result = await chat_service_1.default.getConversation(req.user.id, friendId, limit, offset);
            return res.json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * POST /messages/:friendId — Send a message (REST fallback for non-Socket.IO clients)
     */
    async sendMessage(req, res) {
        try {
            const { friendId } = req.params;
            const { content } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({ success: false, message: 'Message content is required' });
            }
            const message = await chat_service_1.default.saveMessage(req.user.id, friendId, content);
            return res.status(201).json({ success: true, data: { message } });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * POST /messages/:friendId/read — Mark all messages from a friend as read
     */
    async markAsRead(req, res) {
        try {
            const { friendId } = req.params;
            await chat_service_1.default.markMessagesAsRead(req.user.id, friendId);
            return res.json({ success: true, data: { message: 'Messages marked as read' } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.default = new ChatController();
