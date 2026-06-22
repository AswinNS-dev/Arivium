import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import FriendsService from '../services/friends.service';

class FriendsController {
  /**
   * POST /request — Send a friend request
   * Body: { receiverId: string }
   */
  async sendRequest(req: AuthRequest, res: Response) {
    try {
      const { receiverId } = req.body;
      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'receiverId is required' });
      }

      const request = await FriendsService.sendFriendRequest(req.user!.id, receiverId);
      return res.status(201).json({ success: true, data: { request } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /accept/:requestId — Accept a friend request
   */
  async acceptRequest(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const request = await FriendsService.acceptFriendRequest(requestId, req.user!.id);
      return res.json({ success: true, data: { request } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /reject/:requestId — Reject a friend request
   */
  async rejectRequest(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const request = await FriendsService.rejectFriendRequest(requestId, req.user!.id);
      return res.json({ success: true, data: { request } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /:friendId — Remove a connection (unfriend)
   */
  async removeFriend(req: AuthRequest, res: Response) {
    try {
      const { friendId } = req.params;
      await FriendsService.removeFriend(req.user!.id, friendId);
      return res.json({ success: true, data: { message: 'Connection removed' } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /connections — List all accepted friends
   */
  async getConnections(req: AuthRequest, res: Response) {
    try {
      const connections = await FriendsService.getConnections(req.user!.id);
      return res.json({ success: true, data: { connections } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /pending — List pending incoming friend requests
   */
  async getPending(req: AuthRequest, res: Response) {
    try {
      const requests = await FriendsService.getPendingRequests(req.user!.id);
      return res.json({ success: true, data: { requests } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /sent — List sent outgoing friend requests
   */
  async getSent(req: AuthRequest, res: Response) {
    try {
      const requests = await FriendsService.getSentRequests(req.user!.id);
      return res.json({ success: true, data: { requests } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /status/:userId — Check friendship status with a user
   */
  async getStatus(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const status = await FriendsService.getFriendshipStatus(req.user!.id, userId);
      return res.json({ success: true, data: status });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new FriendsController();
