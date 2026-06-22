import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import UsersService from '../services/users.service';

class UsersController {
  /**
   * GET / — List all registered users (except current user)
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await UsersService.getAllUsers(req.user!.id, page, limit);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /search — Search users by name or email
   */
  async search(req: AuthRequest, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query || !query.trim()) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await UsersService.searchUsers(req.user!.id, query, page, limit);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /:id — Get a specific user's profile
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.id;
      const profile = await UsersService.getUserProfile(userId);

      return res.json({ success: true, data: { user: profile } });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
}

export default new UsersController();
