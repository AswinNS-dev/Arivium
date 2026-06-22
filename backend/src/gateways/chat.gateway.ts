import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { supabaseAdmin } from '../config/supabase';
import ChatService from '../services/chat.service';
import FriendsService from '../services/friends.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

/** Map of userId -> socketId for online status tracking */
const onlineUsers = new Map<string, string>();

export function initializeChatGateway(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const { data, error } = await supabaseAdmin.auth.getUser(token as string);

      if (error || !data.user) {
        return next(new Error('Invalid or expired token'));
      }

      // Fetch profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name')
        .eq('id', data.user.id)
        .single();

      socket.userId = data.user.id;
      socket.userName = profile?.name ?? data.user.email ?? 'Unknown';

      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User connected: ${socket.userName} (${userId})`);

    // Track online status
    onlineUsers.set(userId, socket.id);

    // Broadcast online status to friends
    broadcastOnlineStatus(io, userId, true);

    /**
     * Send a message to another user.
     * Payload: { receiverId: string, content: string }
     */
    socket.on('send_message', async (payload: { receiverId: string; content: string }, callback?: Function) => {
      try {
        const { receiverId, content } = payload;

        // Verify they are friends
        const status = await FriendsService.getFriendshipStatus(userId, receiverId);
        if (status.status !== 'connected') {
          if (callback) callback({ error: 'You can only message connected friends' });
          return;
        }

        // Save to database
        const message = await ChatService.saveMessage(userId, receiverId, content);

        // Send to receiver if they are online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', {
            id: message.id,
            senderId: userId,
            senderName: socket.userName,
            content: message.content,
            createdAt: message.created_at,
          });
        }

        // Acknowledge to sender
        if (callback) callback({ success: true, message });
      } catch (err: any) {
        if (callback) callback({ error: err.message });
      }
    });

    /**
     * Typing indicator.
     * Payload: { receiverId: string, isTyping: boolean }
     */
    socket.on('typing', (payload: { receiverId: string; isTyping: boolean }) => {
      const receiverSocketId = onlineUsers.get(payload.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', {
          userId,
          userName: socket.userName,
          isTyping: payload.isTyping,
        });
      }
    });

    /**
     * Mark messages as read.
     * Payload: { senderId: string }
     */
    socket.on('mark_read', async (payload: { senderId: string }) => {
      try {
        await ChatService.markMessagesAsRead(userId, payload.senderId);

        // Notify the sender that messages were read
        const senderSocketId = onlineUsers.get(payload.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', { readBy: userId });
        }
      } catch (err) {
        // Silently fail
      }
    });

    /**
     * Get online friends list.
     */
    socket.on('get_online_friends', async (callback?: Function) => {
      try {
        const connections = await FriendsService.getConnections(userId);
        const onlineFriends = connections
          .filter((c: any) => onlineUsers.has(c.id))
          .map((c: any) => ({ id: c.id, name: c.name }));

        if (callback) callback({ onlineFriends });
      } catch (err) {
        if (callback) callback({ onlineFriends: [] });
      }
    });

    /**
     * Handle disconnect.
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName} (${userId})`);
      onlineUsers.delete(userId);
      broadcastOnlineStatus(io, userId, false);
    });
  });

  return io;
}

/**
 * Broadcast a user's online/offline status to their friends.
 */
async function broadcastOnlineStatus(io: SocketServer, userId: string, isOnline: boolean) {
  try {
    const connections = await FriendsService.getConnections(userId);
    for (const friend of connections) {
      const friendSocketId = onlineUsers.get((friend as any).id);
      if (friendSocketId) {
        io.to(friendSocketId).emit('user_status', { userId, isOnline });
      }
    }
  } catch {
    // Silently fail
  }
}
