import { useState } from 'react';
import { Button, Avatar, Input } from '../../components';
import { Send, Users, MessageSquare } from 'lucide-react';
import styles from './Community.module.css';

const MOCK_CONNECTIONS = [
  { id: 1, name: 'Alice Chen', role: 'Data Scientist', status: 'connected', mutualInterests: ['Machine Learning', 'Python', 'Tech Ethics'] },
  { id: 2, name: 'Bob Smith', role: 'Frontend Dev', status: 'connected', mutualInterests: ['React', 'UI/UX', 'Web3'] },
  { id: 3, name: 'Charlie Davis', role: 'Product Manager', status: 'pending', mutualInterests: ['Agile', 'Product Strategy'] },
];

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'connections'>('connections');
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'Alice Chen', text: 'Hey, saw you are working on the React roadmap too!', isMine: false },
    { sender: 'Me', text: 'Yes! It has been challenging but fun.', isMine: true }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatHistory([...chatHistory, { sender: 'Me', text: message, isMine: true }]);
    setMessage('');
  };

  const activeConnection = MOCK_CONNECTIONS.find(c => c.id === activeChat);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community Hub</h1>
          <p className={styles.subtitle}>Connect with peers, mentors, and grow your network through mutual connections.</p>
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* Left Sidebar for Tabs & Connection List */}
        <div className={styles.sidebar}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'feed' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('feed'); setActiveChat(null); setShowProfile(false); }}
            >
              <MessageSquare size={16} /> Feed
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'connections' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('connections')}
            >
              <Users size={16} /> Connections
            </button>
          </div>

          <div className={styles.listContainer}>
            {activeTab === 'connections' && (
              <>
                <h3 className={styles.sectionTitle}>Accepted Connections</h3>
                {MOCK_CONNECTIONS.filter(c => c.status === 'connected').map(c => (
                  <div 
                    key={c.id} 
                    className={`${styles.connectionItem} ${activeChat === c.id ? styles.activeChat : ''}`}
                    onClick={() => { setActiveChat(c.id); setShowProfile(false); }}
                  >
                    <Avatar fallback={c.name[0]} size="sm" />
                    <div className={styles.connectionInfo}>
                      <div className={styles.connectionName}>{c.name}</div>
                      <div className={styles.connectionRole}>{c.role}</div>
                    </div>
                  </div>
                ))}
                <h3 className={styles.sectionTitle} style={{ marginTop: 'var(--space-6)' }}>Pending Requests</h3>
                {MOCK_CONNECTIONS.filter(c => c.status === 'pending').map(c => (
                  <div key={c.id} className={styles.connectionItem}>
                    <Avatar fallback={c.name[0]} size="sm" />
                    <div className={styles.connectionInfo}>
                      <div className={styles.connectionName}>{c.name}</div>
                      <div className={styles.connectionRole}>{c.role}</div>
                    </div>
                    <Button variant="outline" size="sm">Accept</Button>
                  </div>
                ))}
              </>
            )}
            {activeTab === 'feed' && (
              <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                Your feed is currently empty. Accept more connections to see updates!
              </div>
            )}
          </div>
        </div>

        {/* Right Area for Chat */}
        <div className={styles.chatArea}>
          {activeChat && activeConnection ? (
            <>
              <div className={styles.chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Avatar fallback={activeConnection.name[0]} size="sm" />
                  <div>
                    <div className={styles.chatName}>{activeConnection.name}</div>
                    <div className={styles.chatRole}>{activeConnection.role}</div>
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
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{activeConnection.role}</p>
                  
                  <h3 style={{ marginTop: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)', fontSize: '16px' }}>Mutual Interests</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {activeConnection.mutualInterests.map(i => (
                      <span key={i} style={{ padding: 'var(--space-1) var(--space-3)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.chatMessages}>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`${styles.messageWrapper} ${msg.isMine ? styles.messageMine : styles.messageTheirs}`}>
                        <div className={styles.messageBubble}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.chatInputArea}>
                    <Input 
                      placeholder="Type a message..." 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <Button variant="primary" onClick={handleSendMessage}><Send size={18} /></Button>
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
