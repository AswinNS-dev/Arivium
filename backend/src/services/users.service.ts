import { supabaseAdmin } from '../config/supabase';

class UsersService {
  /**
   * Get all registered users except the current user.
   * Includes friendship status relative to the current user.
   */
  async getAllUsers(currentUserId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const { data: profiles, error, count } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, avatar_url, role, bio, skills, created_at', { count: 'exact' })
      .neq('id', currentUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    // Fetch friendship statuses for all returned users
    const userIds = (profiles ?? []).map((p) => p.id);

    const { data: friendRequests } = await supabaseAdmin
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.in.(${userIds.join(',')})),and(receiver_id.eq.${currentUserId},sender_id.in.(${userIds.join(',')}))`
      );

    // Build a friendship status map
    const statusMap: Record<string, { status: string; requestId: string; direction: string }> = {};
    for (const req of friendRequests ?? []) {
      const otherUserId = req.sender_id === currentUserId ? req.receiver_id : req.sender_id;
      const direction = req.sender_id === currentUserId ? 'sent' : 'received';
      statusMap[otherUserId] = { status: req.status, requestId: req.id, direction };
    }

    const usersWithStatus = (profiles ?? []).map((profile) => {
      const friendship = statusMap[profile.id];
      let friendshipStatus = 'none';
      if (friendship) {
        if (friendship.status === 'accepted') friendshipStatus = 'connected';
        else if (friendship.status === 'pending' && friendship.direction === 'sent')
          friendshipStatus = 'pending_sent';
        else if (friendship.status === 'pending' && friendship.direction === 'received')
          friendshipStatus = 'pending_received';
      }
      return {
        ...profile,
        friendshipStatus,
        friendRequestId: friendship?.requestId ?? null,
      };
    });

    return {
      users: usersWithStatus,
      total: count ?? 0,
      page,
      limit,
    };
  }

  /**
   * Search users by name or email.
   */
  async searchUsers(currentUserId: string, query: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query.trim().toLowerCase()}%`;

    const { data: profiles, error, count } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, avatar_url, role, bio, skills', { count: 'exact' })
      .neq('id', currentUserId)
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      users: profiles ?? [],
      total: count ?? 0,
      page,
      limit,
    };
  }

  /**
   * Get a single user's profile.
   */
  async getUserProfile(userId: string) {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, avatar_url, role, bio, skills, created_at')
      .eq('id', userId)
      .single();

    if (error) throw new Error('User not found');
    return profile;
  }
}

export default new UsersService();
