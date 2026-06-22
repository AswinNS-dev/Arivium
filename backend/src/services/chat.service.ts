import { supabaseAdmin } from '../config/supabase';

class ChatService {
  /**
   * Save a message between two users.
   */
  async saveMessage(senderId: string, receiverId: string, content: string) {
    if (!content.trim()) throw new Error('Message content cannot be empty');

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get conversation (message history) between two users.
   */
  async getConversation(userId1: string, userId2: string, limit = 50, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact' })
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      messages: data ?? [],
      total: count ?? 0,
    };
  }

  /**
   * Get all recent conversations for a user with last message preview.
   */
  async getRecentConversations(userId: string) {
    // Get all messages involving this user, ordered by most recent
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Group by conversation partner and take the latest message
    const conversationMap = new Map<string, any>();
    for (const msg of messages ?? []) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          lastMessageBy: msg.sender_id === userId ? 'me' : 'them',
          unreadCount: 0,
        });
      }
      // Count unread messages from partner
      if (msg.sender_id === partnerId && !msg.read) {
        const conv = conversationMap.get(partnerId);
        conv.unreadCount++;
      }
    }

    // Fetch partner profiles
    const partnerIds = Array.from(conversationMap.keys());
    if (partnerIds.length === 0) return [];

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, avatar_url, role')
      .in('id', partnerIds);

    const profileMap = new Map<string, any>();
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p);
    }

    return Array.from(conversationMap.values())
      .map((conv) => ({
        ...conv,
        partner: profileMap.get(conv.partnerId) ?? null,
      }))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  /**
   * Mark all messages from a specific sender as read.
   */
  async markMessagesAsRead(receiverId: string, senderId: string) {
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('read', false);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}

export default new ChatService();
