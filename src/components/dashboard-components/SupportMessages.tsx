import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, X, AlertCircle } from 'lucide-react';
import api from '../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../components/home/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../utils/toast';

interface Message {
  id: string;
  senderId: number;
  senderType: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string | Date;
}

interface Ticket {
  id: number;
  subject: string;
  status: string;
  messages: Message[];
  readBy?: {
    user?: string | Date;
    admin?: string | Date;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

const SupportMessages: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messagesEndRef, setMessagesEndRef] = useState<HTMLDivElement | null>(null);
  
  // Use ref to track selectedTicket for polling (avoids stale closures)
  const selectedTicketRef = useRef<Ticket | null>(null);
  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);
  
  // Track last message count to prevent infinite sound (for selected ticket)
  const lastMessageCountRef = useRef<number>(0);
  useEffect(() => {
    if (selectedTicket?.messages) {
      lastMessageCountRef.current = selectedTicket.messages.length;
    }
  }, [selectedTicket?.id]); // Reset when ticket changes
  
  // Track last message counts for all tickets (for notifications when panel is closed)
  const lastTicketMessageCountsRef = useRef<Map<number, number>>(new Map());

  // Notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Calculate unread messages for user
  const getUnreadCount = (ticket: Ticket): number => {
    if (!ticket.messages || ticket.messages.length === 0) return 0;
    if (!ticket.readBy?.user) return ticket.messages.filter((m: Message) => m.senderType === 'admin').length;
    const lastReadTime = new Date(ticket.readBy.user).getTime();
    return ticket.messages.filter((m: Message) => 
      m.senderType === 'admin' && new Date(m.createdAt).getTime() > lastReadTime
    ).length;
  };

  // Mark ticket as read
  const markTicketAsRead = async (ticketId: number) => {
    try {
      await api.post(`/messages/${ticketId}/mark-read`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Failed to mark ticket as read:', error);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  // Real-time polling for messages
  useEffect(() => {
    if (!selectedTicket) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/messages/${selectedTicket.id}`, {
          withCredentials: true,
        });
        if (response.data?.ticket) {
          const newTicket = response.data.ticket;
          const oldMessageCount = lastMessageCountRef.current;
          const newMessageCount = newTicket.messages?.length || 0;
          
          // Check if new messages arrived (only play sound once per new message)
          if (newMessageCount > oldMessageCount) {
            // Only play sound if message is from admin (not from user)
            const lastMessage = newTicket.messages?.[newTicket.messages.length - 1];
            if (lastMessage && lastMessage.senderType === 'admin') {
              console.log('[SupportMessages] Playing notification sound for new admin message (panel open)');
              playNotificationSound();
            }
            scrollToBottom();
            lastMessageCountRef.current = newMessageCount;
            // Also update the ticket message count ref
            lastTicketMessageCountsRef.current.set(newTicket.id, newMessageCount);
          }
          
          // Update selected ticket without closing the modal/panel
          setSelectedTicket((prev) => {
            if (prev && prev.id === newTicket.id) {
              // Preserve all existing state, just update the data
              return { ...prev, ...newTicket };
            }
            return prev;
          });
          
          // Update tickets list in background
          setTickets((prev) => 
            prev.map(t => t.id === newTicket.id ? newTicket : t)
          );
        }
      } catch (error) {
        console.error('Failed to poll ticket updates:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedTicket?.id]);

  // Poll tickets list for unread counts (background only)
  useEffect(() => {
    const pollTicketsInterval = setInterval(() => {
      // Use ref to get latest selectedTicket value
      const currentSelectedId = selectedTicketRef.current?.id;
      
      // Fetch in background without affecting UI
      api.get('/messages', { withCredentials: true })
        .then(response => {
          if (response.data?.status === 'success' && response.data.tickets) {
            const updatedTickets = response.data.tickets || [];
            
            // Check for new messages in any ticket (even if panel is closed)
            updatedTickets.forEach((ticket: Ticket) => {
              const lastCount = lastTicketMessageCountsRef.current.get(ticket.id);
              const currentCount = ticket.messages?.length || 0;
              
              // Initialize if not set
              if (lastCount === undefined) {
                lastTicketMessageCountsRef.current.set(ticket.id, currentCount);
                return; // Skip notification on first load
              }
              
              // If new messages arrived and panel might be closed, check if message is from admin
              if (currentCount > lastCount) {
                const lastMessage = ticket.messages?.[ticket.messages.length - 1];
                // Only play sound if:
                // 1. Panel is closed (no selected ticket) OR selected ticket is different
                // 2. Message is from admin
                if (lastMessage && lastMessage.senderType === 'admin') {
                  const isPanelOpen = currentSelectedId === ticket.id;
                  if (!isPanelOpen) {
                    // Panel is closed, play notification sound
                    console.log('[SupportMessages] Playing notification sound for new admin message');
                    playNotificationSound();
                  }
                }
                lastTicketMessageCountsRef.current.set(ticket.id, currentCount);
              } else if (currentCount > 0) {
                // Update count even if no new messages (in case count decreased)
                lastTicketMessageCountsRef.current.set(ticket.id, currentCount);
              }
            });
            
            // Update tickets list
            setTickets((prev) => {
              // Preserve selected ticket if it exists
              if (currentSelectedId) {
                const updatedTicket = updatedTickets.find((t: Ticket) => t.id === currentSelectedId);
                if (updatedTicket) {
                  setSelectedTicket((prev) => {
                    if (prev && prev.id === currentSelectedId) {
                      // Merge new data with existing to preserve UI state
                      return { ...prev, ...updatedTicket };
                    }
                    return prev;
                  });
                }
              }
              
              return updatedTickets;
            });
          }
        })
        .catch(error => {
          console.error('Background poll failed:', error);
        });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollTicketsInterval);
  }, []); // Empty deps - use refs instead

  // Mark as read when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      markTicketAsRead(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    fetchTickets();
  }, []);
  
  // Initialize message counts when tickets are loaded
  useEffect(() => {
    tickets.forEach((ticket) => {
      if (!lastTicketMessageCountsRef.current.has(ticket.id)) {
        lastTicketMessageCountsRef.current.set(ticket.id, ticket.messages?.length || 0);
      }
    });
  }, [tickets]);

  const fetchTickets = async (background: boolean = false) => {
    try {
      if (!background) {
        setLoading(true);
      }
      const response = await api.get('/messages', { withCredentials: true });
      if (response.data?.status === 'success') {
        // Use functional update to preserve selectedTicket
        setTickets((prevTickets) => {
          const newTickets = response.data.tickets || [];
          const currentSelectedId = selectedTicket?.id;
          
          // If we have a selected ticket, update it in the background
          if (currentSelectedId && background) {
            const updatedTicket = newTickets.find((t: Ticket) => t.id === currentSelectedId);
            if (updatedTicket) {
              // Update selected ticket without closing modal
              setSelectedTicket((prev) => {
                if (prev && prev.id === currentSelectedId) {
                  return { ...prev, ...updatedTicket };
                }
                return prev;
              });
            }
          }
          
          return newTickets;
        });
        
        // Only auto-select first ticket if no ticket is selected and this is initial load
        if (response.data.tickets?.length > 0 && !selectedTicket && !background) {
          setSelectedTicket(response.data.tickets[0]);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      if (!background) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to load messages');
        }
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      const subject = newTicketSubject || 'Support Request';
      const message = newTicketMessage.trim();
      
      const response = await api.post(
        '/messages',
        {
          subject,
          message,
        },
        { withCredentials: true }
      );

      if (response.data?.status === 'success') {
        toast.success('Message sent successfully');
        setNewTicketSubject('');
        setNewTicketMessage('');
        setShowNewTicket(false);
        
        // Update tickets list without full fetch
        if (response.data.ticket) {
          setTickets((prev) => [...prev, response.data.ticket]);
          setSelectedTicket(response.data.ticket);
        } else {
          // Fallback: fetch tickets if ticket not in response
          await fetchTickets(false);
          if (response.data.ticket) {
            setSelectedTicket(response.data.ticket);
          }
        }
      } else {
        toast.error(response.data?.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedTicket) {
      return;
    }

    const messageToSend = newMessage.trim();
    const optimisticMessageId = `temp-${Date.now()}`;
    let shouldRevert = false;

    try {
      setSending(true);
      setNewMessage(''); // Clear input immediately for better UX
      
      // Optimistically add message to UI
      const optimisticMessage = {
        id: optimisticMessageId,
        senderId: 0, // Will be updated from response
        senderType: 'user' as const,
        senderName: 'You',
        message: messageToSend,
        createdAt: new Date(),
      };
      
      setSelectedTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), optimisticMessage],
        };
      });
      
      const response = await api.post(
        `/messages/${selectedTicket.id}/reply`,
        { message: messageToSend },
        { withCredentials: true }
      );

      if (response.data?.status === 'success') {
        // Update with real ticket data from response
        if (response.data.ticket) {
          setSelectedTicket((prev) => {
            if (prev && prev.id === response.data.ticket.id) {
              return { ...prev, ...response.data.ticket };
            }
            return prev;
          });
          
          // Update tickets list in background
          setTickets((prev) => 
            prev.map(t => t.id === response.data.ticket.id ? response.data.ticket : t)
          );
        }
        setTimeout(() => scrollToBottom(), 100);
      } else {
        shouldRevert = true;
        setNewMessage(messageToSend); // Restore message
      }
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      toast.error(error.response?.data?.message || 'Failed to send reply');
      shouldRevert = true;
      setNewMessage(messageToSend); // Restore message
    } finally {
      if (shouldRevert) {
        // Revert optimistic update on error
        setSelectedTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages?.filter(m => m.id !== optimisticMessageId) || [],
          };
        });
      }
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>
        Loading messages...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '600px', gap: '20px' }}>
      {/* Tickets List */}
      <div
        style={{
          width: '300px',
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold' }}>Messages</h3>
          <button
            onClick={() => setShowNewTicket(true)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: colors.accent,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tickets.length === 0 ? (
            <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '20px', fontSize: '14px' }}>
              No messages yet. Click + to start a conversation.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={async () => {
                  setSelectedTicket(ticket);
                  await markTicketAsRead(ticket.id);
                }}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  background:
                    selectedTicket?.id === ticket.id
                      ? colors.accent + '20'
                      : colors.isDark
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                  border: `1px solid ${
                    selectedTicket?.id === ticket.id
                      ? colors.accent
                      : colors.isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)'
                  }`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                    {ticket.subject}
                  </div>
                  {getUnreadCount(ticket) > 0 && (
                    <div
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {getUnreadCount(ticket)}
                    </div>
                  )}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                  {ticket.messages?.length || 0} messages
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '11px', marginTop: '4px' }}>
                  {new Date(ticket.updatedAt as string).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {showNewTicket ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold' }}>New Message</h3>
              <button
                onClick={() => setShowNewTicket(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.text,
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: colors.text, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Subject (optional)
              </label>
              <input
                type="text"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Enter subject..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: colors.text, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Message
              </label>
              <textarea
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
            <button
              onClick={handleCreateTicket}
              disabled={sending || !newTicketMessage.trim()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: sending ? colors.textSecondary : colors.accent,
                color: 'white',
                border: 'none',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        ) : selectedTicket ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                {selectedTicket.subject}
              </h3>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                Status: {selectedTicket.status}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '20px',
                padding: '16px',
                background: colors.isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
              }}
            >
              {selectedTicket.messages?.map((msg, index) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.senderType === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background:
                        msg.senderType === 'user'
                          ? colors.accent
                          : colors.isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)',
                      color: msg.senderType === 'user' ? 'white' : colors.text,
                    }}
                  >
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                      {msg.senderName} {msg.senderType === 'admin' && '(Support)'}
                    </div>
                    <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                      {new Date(msg.createdAt as string).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={(el) => setMessagesEndRef(el as any)} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !newMessage.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: sending ? colors.textSecondary : colors.accent,
                  color: 'white',
                  border: 'none',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Select a conversation or create a new message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportMessages;

