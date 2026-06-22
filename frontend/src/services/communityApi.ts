import { apiBaseUrl } from './apiConfig';
import { getAuthToken } from './authApi';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'API request failed');
  }
  return payload.data as T;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  bio?: string;
  skills?: string[];
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  friendRequestId?: string | null;
}

export interface FriendRequest {
  requestId: string;
  sentAt: string;
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
}

export interface Connection {
  connectionId: string;
  connectedSince: string;
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  bio?: string;
  skills?: string[];
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: 'me' | 'them';
  unreadCount: number;
  partner: Profile | null;
}

export const communityApi = {
  // Discovery
  getUsers: (page = 1, limit = 50) => 
    request<{ users: Profile[]; total: number }>('/users?' + new URLSearchParams({ page: String(page), limit: String(limit) })),
  
  searchUsers: (query: string, page = 1, limit = 20) =>
    request<{ users: Profile[]; total: number }>('/users/search?' + new URLSearchParams({ q: query, page: String(page), limit: String(limit) })),
    
  getProfile: (userId: string) =>
    request<{ user: Profile }>(`/users/${userId}`),

  // Friends Requests & Connections
  sendFriendRequest: (receiverId: string) =>
    request<{ request: any }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiverId }),
    }),

  acceptFriendRequest: (requestId: string) =>
    request<{ request: any }>(`/friends/accept/${requestId}`, {
      method: 'POST',
    }),

  rejectFriendRequest: (requestId: string) =>
    request<{ request: any }>(`/friends/reject/${requestId}`, {
      method: 'POST',
    }),

  removeFriend: (friendId: string) =>
    request<{ message: string }>(`/friends/${friendId}`, {
      method: 'DELETE',
    }),

  getConnections: () =>
    request<{ connections: Connection[] }>('/friends/connections'),

  getPendingRequests: () =>
    request<{ requests: FriendRequest[] }>('/friends/pending'),

  getSentRequests: () =>
    request<{ requests: FriendRequest[] }>('/friends/sent'),

  getFriendshipStatus: (userId: string) =>
    request<{ status: 'none' | 'pending_sent' | 'pending_received' | 'connected'; requestId: string | null }>(`/friends/status/${userId}`),

  // Chat History
  getConversations: () =>
    request<{ conversations: Conversation[] }>('/chat/conversations'),

  getChatHistory: (friendId: string, limit = 50, offset = 0) =>
    request<{ messages: Message[]; total: number }>(`/chat/messages/${friendId}?` + new URLSearchParams({ limit: String(limit), offset: String(offset) })),

  sendMessage: (friendId: string, content: string) =>
    request<{ message: Message }>(`/chat/messages/${friendId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  markMessagesAsRead: (friendId: string) =>
    request<{ message: string }>(`/chat/messages/${friendId}/read`, {
      method: 'POST',
    }),
};
export const Profile = {} as any;
export const Connection = {} as any;
export const FriendRequest = {} as any;
export const Message = {} as any;
export const Conversation = {} as any;
