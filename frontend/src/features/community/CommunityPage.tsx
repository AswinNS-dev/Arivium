import { useState, useEffect, useRef } from 'react';
import { Button, Avatar, Input } from '../../components';
import { Send, Users, MessageSquare, UserPlus, UserCheck, UserX, Search, MessageCircle } from 'lucide-react';
import { communityApi } from '../../services/communityApi';
import type { Profile, Connection, FriendRequest, Message, Conversation } from '../../services/communityApi';
import { connectSocket, getSocket, disconnectSocket } from '../../services/socket';
import { getAuthUser } from '../../services/authApi';
import styles from './Community.module.css';

export function CommunityPage() {
  const currentUser = getAuthUser();
  const [activeTab, setActiveTab] = useState<'connections' | 'discover'>('connections');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [friendIsTyping, setFriendIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch initial listing data on mount & tab change
  useEffect(() => {
    fetchMainData();
  }, [activeTab]);

  const fetchMainData = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'connections') {
        const [connRes, pendingRes] = await Promise.all([
          communityApi.getConnections(),
          communityApi.getPendingRequests()
        ]);
        setConnections(connRes.connections);
        setPendingRequests(connRes.connections.length === 0 && pendingRes.requests.length > 0 ? pendingRes.requests : pendingRes.requests);
      } else {
        const discRes = await communityApi.getUsers();
        setDiscoverUsers(discRes.users);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // 2. Connect Socket.IO for real-time features
  useEffect(() => {
    if (!currentUser) return;

    const socket = connectSocket();

    // Listen for incoming messages
    socket.on('receive_message', (msg: { id: string; senderId: string; content: string; createdAt: string }) => {
      // If we are actively chatting with this user, append to messages
      if (activeChat === msg.senderId) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: msg.id,
            sender_id: msg.senderId,
            receiver_id: currentUser.id,
            content: msg.content,
            read: true,
            created_at: msg.createdAt
          }
        ]);
        // Let the sender know we read it
        socket.emit('mark_read', { senderId: msg.senderId });
      } else {
        // Increment unread count or show notification
        fetchMainData();
      }
    });

    // Listen for typing indicator
    socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      if (activeChat === data.userId) {
        setFriendIsTyping(data.isTyping);
      }
    });

    // Listen for online status updates
    socket.on('user_status', (data: { userId: string; isOnline: boolean }) => {
      setOnlineFriends((prev) => {
        const next = new Set(prev);
        if (data.isOnline) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    // Ask server for currently online friends
    socket.emit('get_online_friends', (res: { onlineFriends: { id: string; name: string }[] }) => {
      if (res?.onlineFriends) {
        const onlineIds = res.onlineFriends.map((f) => f.id);
        setOnlineFriends(new Set(onlineIds));
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('user_status');
      disconnectSocket();
    };
  }, [currentUser, activeChat]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, friendIsTyping]);

  // 3. Load chat history when activeChat changes
  useEffect(() => {
    if (!activeChat) {
      setChatHistory([]);
      return;
    }
    
    const loadChat = async () => {
      setChatLoading(true);
      try {
        const res = await communityApi.getChatHistory(activeChat);
        setChatHistory(res.messages);

        // Mark messages as read on the backend
        await communityApi.markMessagesAsRead(activeChat);
        
        // Notify via socket
        const socket = getSocket();
        if (socket) {
          socket.emit('mark_read', { senderId: activeChat });
        }
      } catch (err: any) {
        console.error('Failed to load chat history', err);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [activeChat]);

  // 4. Action Handlers
  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      await communityApi.sendFriendRequest(receiverId);
      // Update local status to pending_sent
      setDiscoverUsers((prev) =>
        prev.map((u) => (u.id === receiverId ? { ...u, friendshipStatus: 'pending_sent' } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string, senderId?: string) => {
    try {
      await communityApi.acceptFriendRequest(requestId);
      fetchMainData();
      if (activeTab === 'discover' && senderId) {
        setDiscoverUsers((prev) =>
          prev.map((u) => (u.id === senderId ? { ...u, friendshipStatus: 'connected' } : u))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      await communityApi.rejectFriendRequest(requestId);
      fetchMainData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMainData();
      return;
    }
    setLoading(true);
    try {
      const res = await communityApi.searchUsers(searchQuery);
      setDiscoverUsers(res.users);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const socket = getSocket();
    const messageContent = message;
    setMessage('');

    if (socket && socket.connected) {
      // Send via socket.io
      socket.emit(
        'send_message',
        { receiverId: activeChat, content: messageContent },
        (response: { error?: string; message?: Message }) => {
          if (response.error) {
            alert(response.error);
          } else if (response.message) {
            setChatHistory((prev) => [...prev, response.message!]);
          }
        }
      );
    } else {
      // Fallback to REST
      try {
        const res = await communityApi.sendMessage(activeChat, messageContent);
        setChatHistory((prev) => [...prev, res.message]);
      } catch (err: any) {
        alert(err.message || 'Failed to send message');
      }
    }

    // Stop typing immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    handleTypingEvent(false);
  };

  // Emit typing event to backend
  const handleTypingEvent = (typingState: boolean) => {
    const socket = getSocket();
    if (socket && socket.connected && activeChat) {
      socket.emit('typing', { receiverId: activeChat, isTyping: typingState });
      setIsTyping(typingState);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else {
      // User is typing
      if (!isTyping) {
        handleTypingEvent(true);
      }
      // Reset timeout to stop typing indicator after 2 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingEvent(false);
      }, 2000);
    }
  };

  const activeConnection = connections.find((c) => c.id === activeChat);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community Hub</h1>
          <p className={styles.subtitle}>Connect with peers, mentors, and grow your network through mutual connections.</p>
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* Left Sidebar for Tabs & Connections list */}
        <div className={styles.sidebar}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'connections' ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab('connections');
                setActiveChat(null);
                setShowProfile(false);
              }}
            >
              <Users size={16} /> Connections
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'discover' ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveTab('discover');
                setActiveChat(null);
                setShowProfile(false);
              }}
            >
              <Search size={16} /> Discover
            </button>
          </div>

          {activeTab === 'discover' && (
            <form className={styles.searchWrapper} onSubmit={handleSearch}>
              <Input
                placeholder="Search registered students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
                className={styles.searchBar}
                style={{ marginBottom: 0 }}
              />
            </form>
          )}

          <div className={styles.listContainer}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                Loading profiles...
              </div>
            ) : error ? (
              <div className={styles.authError}>{error}</div>
            ) : activeTab === 'connections' ? (
              <>
                <h3 className={styles.sectionTitle}>Accepted Connections</h3>
                {connections.length === 0 ? (
                  <p style={{ padding: '0 var(--space-2)', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                    No connections yet. Try the Discover tab to find friends!
                  </p>
                ) : (
                  connections.map((c) => (
                    <div
                      key={c.id}
                      className={`${styles.connectionItem} ${activeChat === c.id ? styles.activeChat : ''}`}
                      onClick={() => {
                        setActiveChat(c.id);
                        setShowProfile(false);
                      }}
                    >
                      <div className={styles.avatarWrapper}>
                        <Avatar fallback={c.name[0]} size="sm" />
                        {onlineFriends.has(c.id) && <span className={styles.onlineDot} />}
                      </div>
                      <div className={styles.connectionInfo}>
                        <div className={styles.connectionName}>{c.name}</div>
                        <div className={styles.connectionRole}>{c.role || 'Student'}</div>
                      </div>
                    </div>
                  ))
                )}

                <h3 className={styles.sectionTitle} style={{ marginTop: 'var(--space-6)' }}>
                  Pending Requests
                </h3>
                {pendingRequests.length === 0 ? (
                  <p style={{ padding: '0 var(--space-2)', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                    No pending friend requests.
                  </p>
                ) : (
                  pendingRequests.map((r) => (
                    <div key={r.requestId} className={styles.connectionItem} style={{ cursor: 'default' }}>
                      <Avatar fallback={r.name[0]} size="sm" />
                      <div className={styles.connectionInfo}>
                        <div className={styles.connectionName}>{r.name}</div>
                        <div className={styles.connectionRole}>{r.role || 'Student'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleAcceptFriendRequest(r.requestId)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleRejectFriendRequest(r.requestId)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                <h3 className={styles.sectionTitle}>All Registered Students</h3>
                {discoverUsers.length === 0 ? (
                  <p style={{ padding: '0 var(--space-2)', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                    No students found.
                  </p>
                ) : (
                  discoverUsers.map((u) => (
                    <div key={u.id} className={styles.discoverItem}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <Avatar fallback={u.name[0]} size="sm" />
                        <div>
                          <div className={styles.connectionName}>{u.name}</div>
                          <div className={styles.connectionRole}>{u.role || 'Student'}</div>
                        </div>
                      </div>

                      {u.friendshipStatus === 'none' && (
                        <Button variant="outline" size="sm" onClick={() => handleSendFriendRequest(u.id)}>
                          <UserPlus size={14} style={{ marginRight: '4px' }} /> Connect
                        </Button>
                      )}
                      {u.friendshipStatus === 'pending_sent' && (
                        <span className={styles.badge}>Requested</span>
                      )}
                      {u.friendshipStatus === 'pending_received' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptFriendRequest(u.friendRequestId || '', u.id)}
                        >
                          Accept
                        </Button>
                      )}
                      {u.friendshipStatus === 'connected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab('connections');
                            setActiveChat(u.id);
                          }}
                        >
                          <MessageCircle size={14} style={{ marginRight: '4px' }} /> Chat
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Area for Chat */}
        <div className={styles.chatArea}>
          {activeChat && activeConnection ? (
            <>
              <div className={styles.chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className={styles.avatarWrapper}>
                    <Avatar fallback={activeConnection.name[0]} size="sm" />
                    {onlineFriends.has(activeConnection.id) && <span className={styles.onlineDot} />}
                  </div>
                  <div>
                    <div className={styles.chatName}>{activeConnection.name}</div>
                    <div className={styles.chatRole}>{activeConnection.role || 'Student'}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowProfile(!showProfile)}>
                  {showProfile ? 'Back to Chat' : 'View Profile'}
                </Button>
              </div>

              {showProfile ? (
                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <Avatar fallback={activeConnection.name[0]} size="lg" />
                  <h2 style={{ fontSize: '24px', margin: 0 }}>{activeConnection.name}</h2>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{activeConnection.role || 'Student'}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    {activeConnection.bio || 'No bio provided yet.'}
                  </p>

                  <h3
                    style={{
                      marginTop: 'var(--space-4)',
                      borderBottom: '1px solid var(--color-border)',
                      paddingBottom: 'var(--space-2)',
                      fontSize: '16px'
                    }}
                  >
                    Skills &amp; Interests
                  </h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {activeConnection.skills && activeConnection.skills.length > 0 ? (
                      activeConnection.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            padding: 'var(--space-1) var(--space-3)',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>No skills listed.</span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.chatMessages}>
                    {chatLoading ? (
                      <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-tertiary)' }}>
                        Loading message history...
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-tertiary)' }}>
                        No messages yet. Say hello!
                      </div>
                    ) : (
                      chatHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={`${styles.messageWrapper} ${
                            msg.sender_id === currentUser?.id ? styles.messageMine : styles.messageTheirs
                          }`}
                        >
                          <div className={styles.messageBubble}>{msg.content}</div>
                        </div>
                      ))
                    )}
                    {friendIsTyping && (
                      <div className={`${styles.messageWrapper} ${styles.messageTheirs}`}>
                        <div className={styles.messageBubble} style={{ fontStyle: 'italic', opacity: 0.7 }}>
                          typing...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className={styles.chatInputArea}>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <Button variant="primary" onClick={handleSendMessage}>
                      <Send size={18} />
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.emptyChat}>
              <MessageSquare size={48} color="var(--color-border)" />
              <p>Select an accepted connection to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default CommunityPage;
