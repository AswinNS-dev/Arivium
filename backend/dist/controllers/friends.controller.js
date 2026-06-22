"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const friends_service_1 = __importDefault(require("../services/friends.service"));
class FriendsController {
    /**
     * POST /request — Send a friend request
     * Body: { receiverId: string }
     */
    async sendRequest(req, res) {
        try {
            const { receiverId } = req.body;
            if (!receiverId) {
                return res.status(400).json({ success: false, message: 'receiverId is required' });
            }
            const request = await friends_service_1.default.sendFriendRequest(req.user.id, receiverId);
            return res.status(201).json({ success: true, data: { request } });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * POST /accept/:requestId — Accept a friend request
     */
    async acceptRequest(req, res) {
        try {
            const { requestId } = req.params;
            const request = await friends_service_1.default.acceptFriendRequest(requestId, req.user.id);
            return res.json({ success: true, data: { request } });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * POST /reject/:requestId — Reject a friend request
     */
    async rejectRequest(req, res) {
        try {
            const { requestId } = req.params;
            const request = await friends_service_1.default.rejectFriendRequest(requestId, req.user.id);
            return res.json({ success: true, data: { request } });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * DELETE /:friendId — Remove a connection (unfriend)
     */
    async removeFriend(req, res) {
        try {
            const { friendId } = req.params;
            await friends_service_1.default.removeFriend(req.user.id, friendId);
            return res.json({ success: true, data: { message: 'Connection removed' } });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /connections — List all accepted friends
     */
    async getConnections(req, res) {
        try {
            const connections = await friends_service_1.default.getConnections(req.user.id);
            return res.json({ success: true, data: { connections } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /pending — List pending incoming friend requests
     */
    async getPending(req, res) {
        try {
            const requests = await friends_service_1.default.getPendingRequests(req.user.id);
            return res.json({ success: true, data: { requests } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /sent — List sent outgoing friend requests
     */
    async getSent(req, res) {
        try {
            const requests = await friends_service_1.default.getSentRequests(req.user.id);
            return res.json({ success: true, data: { requests } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /status/:userId — Check friendship status with a user
     */
    async getStatus(req, res) {
        try {
            const { userId } = req.params;
            const status = await friends_service_1.default.getFriendshipStatus(req.user.id, userId);
            return res.json({ success: true, data: status });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.default = new FriendsController();
