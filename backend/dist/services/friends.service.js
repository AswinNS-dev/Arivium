"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
class FriendsService {
    /**
     * Send a friend request from sender to receiver.
     */
    async sendFriendRequest(senderId, receiverId) {
        if (senderId === receiverId) {
            throw new Error('You cannot send a friend request to yourself');
        }
        // Check if a request already exists in either direction
        const { data: existing } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select('id, status, sender_id, receiver_id')
            .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
            .maybeSingle();
        if (existing) {
            if (existing.status === 'accepted') {
                throw new Error('You are already connected with this user');
            }
            if (existing.status === 'pending') {
                // If the other user already sent us a request, auto-accept
                if (existing.sender_id === receiverId) {
                    return this.acceptFriendRequest(existing.id, senderId);
                }
                throw new Error('Friend request already sent');
            }
            if (existing.status === 'rejected') {
                // Allow re-sending after rejection by updating the existing record
                const { data, error } = await supabase_1.supabaseAdmin
                    .from('friend_requests')
                    .update({
                    sender_id: senderId,
                    receiver_id: receiverId,
                    status: 'pending',
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error)
                    throw new Error(error.message);
                return data;
            }
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'pending',
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    /**
     * Accept a friend request. Only the receiver can accept.
     */
    async acceptFriendRequest(requestId, userId) {
        const { data: request, error: fetchError } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select('*')
            .eq('id', requestId)
            .single();
        if (fetchError || !request)
            throw new Error('Friend request not found');
        if (request.receiver_id !== userId)
            throw new Error('Only the receiver can accept a friend request');
        if (request.status !== 'pending')
            throw new Error('This request is no longer pending');
        const { data, error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    /**
     * Reject a friend request. Only the receiver can reject.
     */
    async rejectFriendRequest(requestId, userId) {
        const { data: request, error: fetchError } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select('*')
            .eq('id', requestId)
            .single();
        if (fetchError || !request)
            throw new Error('Friend request not found');
        if (request.receiver_id !== userId)
            throw new Error('Only the receiver can reject a friend request');
        if (request.status !== 'pending')
            throw new Error('This request is no longer pending');
        const { data, error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    /**
     * Remove an existing connection (unfriend).
     */
    async removeFriend(userId, friendId) {
        const { error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .delete()
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
            .eq('status', 'accepted');
        if (error)
            throw new Error(error.message);
        return { success: true };
    }
    /**
     * Get all accepted connections (friends) for a user.
     */
    async getConnections(userId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select(`
        id,
        sender_id,
        receiver_id,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey(id, name, email, avatar_url, role, bio, skills),
        receiver:profiles!friend_requests_receiver_id_fkey(id, name, email, avatar_url, role, bio, skills)
      `)
            .eq('status', 'accepted')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        if (error)
            throw new Error(error.message);
        // Flatten to show just the friend (the other person)
        return (data ?? []).map((req) => {
            const friend = req.sender_id === userId ? req.receiver : req.sender;
            return {
                connectionId: req.id,
                connectedSince: req.created_at,
                ...friend,
            };
        });
    }
    /**
     * Get pending incoming friend requests for a user.
     */
    async getPendingRequests(userId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select(`
        id,
        sender_id,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey(id, name, email, avatar_url, role)
      `)
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((req) => ({
            requestId: req.id,
            sentAt: req.created_at,
            ...req.sender,
        }));
    }
    /**
     * Get sent outgoing friend requests for a user.
     */
    async getSentRequests(userId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select(`
        id,
        receiver_id,
        created_at,
        receiver:profiles!friend_requests_receiver_id_fkey(id, name, email, avatar_url, role)
      `)
            .eq('sender_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((req) => ({
            requestId: req.id,
            sentAt: req.created_at,
            ...req.receiver,
        }));
    }
    /**
     * Get the friendship status between two users.
     */
    async getFriendshipStatus(userId, otherUserId) {
        const { data } = await supabase_1.supabaseAdmin
            .from('friend_requests')
            .select('id, sender_id, receiver_id, status')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .maybeSingle();
        if (!data)
            return { status: 'none', requestId: null };
        if (data.status === 'accepted')
            return { status: 'connected', requestId: data.id };
        if (data.status === 'pending' && data.sender_id === userId)
            return { status: 'pending_sent', requestId: data.id };
        if (data.status === 'pending' && data.sender_id === otherUserId)
            return { status: 'pending_received', requestId: data.id };
        return { status: 'none', requestId: null };
    }
}
exports.default = new FriendsService();
