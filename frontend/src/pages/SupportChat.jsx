import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { request } from '../utils/api';
import Loader from '../components/Loader';
import { Send, MessageSquare, ShieldAlert, ArrowLeft, Trash2 } from 'lucide-react';

const SupportChat = () => {
  const { user } = useAuth();
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin select chat states
  const [chatsList, setChatsList] = useState([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const messagesEndRef = useRef(null);

  const fetchUserMessages = async (targetUserId = null) => {
    try {
      const endpoint = targetUserId ? `/support?userId=${targetUserId}` : '/support';
      const data = await request(endpoint, 'GET');
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error.message);
    }
  };

  const fetchAdminChats = async () => {
    try {
      const data = await request('/support/admin/chats', 'GET');
      if (data.success) {
        setChatsList(data.chats);
      }
    } catch (error) {
      console.error('Error fetching admin chats list:', error.message);
    }
  };

  const handleDeleteChat = async (userIdToDelete) => {
    if (!window.confirm('Are you sure you want to permanently delete this chat ticket and all messages?')) return;
    try {
      const data = await request(`/support/chat/${userIdToDelete}`, 'DELETE');
      if (data.success) {
        alert('Support ticket deleted successfully!');
        setChatsList(chatsList.filter(chat => chat.userId !== userIdToDelete));
      }
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      if (user?.role === 'admin') {
        await fetchAdminChats();
      } else {
        await fetchUserMessages();
      }
      setLoading(false);
    };

    if (user) {
      initializeChat();
    }
  }, [user]);

  // Poll for new messages every 5 seconds (basic real-time feel)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (user.role === 'admin') {
        if (selectedChatUserId) {
          fetchUserMessages(selectedChatUserId);
        }
        fetchAdminChats();
      } else {
        fetchUserMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, selectedChatUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectUserChat = async (chatInfo) => {
    setSelectedChatUserId(chatInfo.userId);
    setSelectedChatUser(chatInfo.user);
    setLoading(true);
    await fetchUserMessages(chatInfo.userId);
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageToSend = inputText;
    setInputText('');

    try {
      // 1. Send user message
      const body = { message: messageToSend };
      if (user.role === 'admin' && selectedChatUserId) {
        body.userId = selectedChatUserId;
      }
      
      const data = await request('/support', 'POST', body);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);

        // 2. Simulating Agent Reply in Sandbox mode for regular users
        if (user.role !== 'admin') {
          setTimeout(async () => {
            let autoReply = "Thanks for contacting ApexMarket Support! A developer agent has been notified and will review your ticket shortly.";
            
            const lowerMsg = messageToSend.toLowerCase();
            if (lowerMsg.includes('refund')) {
              autoReply = "Hi! Refunds are processed automatically if the file has not been downloaded. Please provide your Order ID for verification.";
            } else if (lowerMsg.includes('download') || lowerMsg.includes('error') || lowerMsg.includes('zip')) {
              autoReply = "If you encounter download errors, check your purchases tab in the dashboard. Download links expire in 15 minutes but can be regenerated anytime.";
            } else if (lowerMsg.includes('razorpay') || lowerMsg.includes('pay') || lowerMsg.includes('money')) {
              autoReply = "For transaction questions: once Razorpay completes payment, verification unlocks downloads instantly. Let us know if your status shows 'pending'.";
            }

            // Post the simulated admin response to backend so it persists in DB
            try {
              const replyData = await request('/support', 'POST', {
                message: `[AI Assistant] ${autoReply}`,
                userId: user._id, // admin reply belongs to user's chat thread
              });
              if (replyData.success) {
                // To fetch admin response, simulate post directly or refresh
                setMessages((prev) => [...prev, replyData.message]);
              }
            } catch (err) {
              console.error('Failed to post auto-reply:', err.message);
            }
          }, 1500);
        }
      }
    } catch (error) {
      alert(error.message || 'Failed to send message');
    }
  };

  if (loading && !selectedChatUserId && user?.role === 'admin') {
    return <Loader fullPage />;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <MessageSquare size={28} style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>Support Help Center</h2>
      </div>

      {/* Admin Chats List view */}
      {user?.role === 'admin' && !selectedChatUserId ? (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Open Support Tickets
          </h3>
          {chatsList.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>No customer tickets open.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatsList.map((chat) => (
                <div
                  key={chat.userId}
                  onClick={() => selectUserChat(chat)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{chat.user?.name || 'User'}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({chat.user?.email})</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      Last Message: {chat.lastMessage}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(chat.lastMessageAt).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.userId);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete Chat Ticket"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Messaging Chat Window Layout (Both User and Admin Reply Box) */
        <div style={{
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          height: '550px',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {user?.role === 'admin' && (
              <button
                onClick={() => setSelectedChatUserId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '16px' }}>
                {user?.role === 'admin' ? selectedChatUser?.name : 'Platform Support Desk'}
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>✓ Online Support Representative</span>
            </div>
          </div>

          {/* Messages list bubbles */}
          <div style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-primary)'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
                <p>Hello! Ask us anything regarding downloads, payments, or file updates. We are here to help!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === user?._id || (user?.role === 'admin' && msg.isAdminReply);
                return (
                  <div
                    key={msg._id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      background: isMe ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: isMe ? 'white' : 'var(--text-primary)',
                      padding: '12px 16px',
                      borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      boxShadow: 'var(--shadow-sm)',
                      border: isMe ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    {!isMe && user?.role === 'admin' && (
                      <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                        Customer
                      </span>
                    )}
                    {!isMe && user?.role !== 'admin' && msg.isAdminReply && (
                      <span style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                        Support Agent
                      </span>
                    )}
                    <span style={{ fontSize: '14px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{msg.message}</span>
                    <span style={{
                      fontSize: '9px',
                      color: isMe ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-muted)',
                      display: 'block',
                      textAlign: 'right',
                      marginTop: '6px'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Textbox Input footer */}
          <form onSubmit={handleSendMessage} style={{
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type message details here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
