"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_service_1 = __importDefault(require("../services/users.service"));
class UsersController {
    /**
     * GET / — List all registered users (except current user)
     */
    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await users_service_1.default.getAllUsers(req.user.id, page, limit);
            return res.json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /search — Search users by name or email
     */
    async search(req, res) {
        try {
            const query = req.query.q;
            if (!query || !query.trim()) {
                return res.status(400).json({ success: false, message: 'Search query is required' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await users_service_1.default.searchUsers(req.user.id, query, page, limit);
            return res.json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /:id — Get a specific user's profile
     */
    async getProfile(req, res) {
        try {
            const userId = req.params.id;
            const profile = await users_service_1.default.getUserProfile(userId);
            return res.json({ success: true, data: { user: profile } });
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }
}
exports.default = new UsersController();
