import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Filter, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, UserPlus, FileText, X } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Use ref to track selectedTicket for polling (avoids stale closures)
  const selectedTicketRef = useRef<any>(null);
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
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newReply, setNewReply] = useState('');
  const [assignToAdminId, setAssignToAdminId] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [replying, setReplying] = useState(false);
  const [lastMessageCounts, setLastMessageCounts] = useState<Record<number, number>>({});
  const [messagesEndRef, setMessagesEndRef] = useState<HTMLDivElement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

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

  // Calculate unread messages for admin
  const getUnreadCount = (ticket: any): number => {
    if (!ticket.messages || ticket.messages.length === 0) return 0;
    if (!ticket.readBy?.admin) return ticket.messages.filter((m: any) => m.senderType === 'user').length;
    const lastReadTime = new Date(ticket.readBy.admin).getTime();
    return ticket.messages.filter((m: any) => 
      m.senderType === 'user' && new Date(m.createdAt).getTime() > lastReadTime
    ).length;
  };

  // Mark ticket as read
  const markTicketAsRead = async (ticketId: number) => {
    try {
      await api.post(`/admin/support/tickets/${ticketId}/mark-read`, 
        { readerType: 'admin' },
        { withCredentials: true }
      );
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
        const response = await api.get(`/admin/support/tickets/${selectedTicket.id}`, {
          withCredentials: true,
        });
        if (response.data?.ticket) {
          const newTicket = response.data.ticket;
          const oldMessageCount = lastMessageCountRef.current;
          const newMessageCount = newTicket.messages?.length || 0;
          
          // Check if new messages arrived (only play sound once per new message)
          if (newMessageCount > oldMessageCount) {
            // Only play sound if message is from user (not from admin)
            const lastMessage = newTicket.messages?.[newTicket.messages.length - 1];
            if (lastMessage && lastMessage.senderType === 'user') {
              playNotificationSound();
            }
            scrollToBottom();
            lastMessageCountRef.current = newMessageCount;
            // Also update the ticket message count ref
            lastTicketMessageCountsRef.current.set(newTicket.id, newMessageCount);
          }
          
          // Update selected ticket without closing the modal/panel
          setSelectedTicket((prev: any) => {
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
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      
      api.get('/admin/support/tickets', {
        params,
        withCredentials: true,
      })
      .then(response => {
        if (response.data?.status === 'success' && response.data.tickets) {
          const updatedTickets = response.data.tickets || [];
          
          // Check for new messages in any ticket (even if panel is closed)
          updatedTickets.forEach((ticket: any) => {
            const lastCount = lastTicketMessageCountsRef.current.get(ticket.id);
            const currentCount = ticket.messages?.length || 0;
            
            // Initialize if not set
            if (lastCount === undefined) {
              lastTicketMessageCountsRef.current.set(ticket.id, currentCount);
              return; // Skip notification on first load
            }
            
            // If new messages arrived and panel might be closed, check if message is from user
            if (currentCount > lastCount) {
              const lastMessage = ticket.messages?.[ticket.messages.length - 1];
              // Only play sound if:
              // 1. Panel is closed (no selected ticket) OR selected ticket is different
              // 2. Message is from user
              if (lastMessage && lastMessage.senderType === 'user') {
                const isPanelOpen = currentSelectedId === ticket.id;
                if (!isPanelOpen) {
                  // Panel is closed, play notification sound
                  console.log('[SupportTickets] Playing notification sound for new user message');
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
              const updatedTicket = updatedTickets.find((t: any) => t.id === currentSelectedId);
              if (updatedTicket) {
                setSelectedTicket((prev: any) => {
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
  }, [statusFilter, priorityFilter]); // Don't include selectedTicket.id - use refs instead

  // Mark as read when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      markTicketAsRead(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  const [formData, setFormData] = useState({
    userId: '',
    subject: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTickets();
    fetchAdmins();
  }, [statusFilter, priorityFilter]);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/accounts', { withCredentials: true });
      if (response.data?.status === 'success') {
        setAdmins(response.data.admins || []);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const fetchTickets = async (background: boolean = false) => {
    try {
      if (!background) {
        setLoading(true);
      }
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      
      const response = await api.get('/admin/support/tickets', {
        params,
        withCredentials: true,
      });
      if (response.data?.status === 'success') {
        const currentSelectedId = selectedTicket?.id;
        const newTickets = response.data.tickets || [];
        
        // Initialize message counts for new tickets
        if (!background) {
          newTickets.forEach((ticket: any) => {
            if (!lastTicketMessageCountsRef.current.has(ticket.id)) {
              lastTicketMessageCountsRef.current.set(ticket.id, ticket.messages?.length || 0);
            }
          });
        }
        
        setTickets(newTickets);
        // Preserve selected ticket when polling in background
        if (currentSelectedId && background) {
          const updatedTicket = newTickets.find((t: any) => t.id === currentSelectedId);
          if (updatedTicket) {
            // Only update if ticket still exists and we have a selected ticket
            setSelectedTicket((prev: any) => {
              if (prev && prev.id === currentSelectedId) {
                // Merge new data with existing selected ticket to preserve UI state
                return { ...prev, ...updatedTicket };
              }
              return prev;
            });
          }
        }
      } else if (response.data?.status === 'error') {
        if (!background) {
          console.error('Error fetching tickets:', response.data.message);
          toast.error(response.data.message || 'Failed to load support tickets');
          setTickets([]);
        }
      } else if (response.data) {
        // Fallback for old response format
        setTickets(response.data.tickets || []);
      }
    } catch (error: any) {
      if (!background) {
        console.error('Failed to fetch tickets:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.message || 'Failed to load support tickets');
        setTickets([]);
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!formData.userId || !formData.subject || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.post('/admin/support/tickets', formData, { withCredentials: true });
      toast.success('Support ticket created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleUpdate = async (ticketId: number, updates: any) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}`, updates, { withCredentials: true });
      toast.success('Ticket updated successfully!');
      if (updates.assignedTo === undefined) {
        // Refresh selected ticket to get latest messages
        const updated = await api.get(`/admin/support/tickets/${ticketId}`, { withCredentials: true });
        if (updated.data?.ticket) {
          setSelectedTicket(updated.data.ticket);
        }
      } else {
        // Refresh selected ticket
        const updated = await api.get(`/admin/support/tickets/${ticketId}`, { withCredentials: true });
        if (updated.data?.ticket) {
          setSelectedTicket(updated.data.ticket);
        }
      }
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    }
  };

  const handleAssign = async (ticketId: number) => {
    if (!assignToAdminId) {
      toast.error('Please select an admin to assign');
      return;
    }
    try {
      await api.put(`/admin/support/tickets/${ticketId}/assign`, { adminId: parseInt(assignToAdminId) }, { withCredentials: true });
      toast.success('Ticket assigned successfully!');
      setShowAssignModal(false);
      setAssignToAdminId('');
      const updated = await api.get(`/admin/support/tickets/${ticketId}`, { withCredentials: true });
      if (updated.data?.ticket) {
        setSelectedTicket(updated.data.ticket);
      }
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleAddNote = async (ticketId: number) => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    try {
      await api.post(`/admin/support/tickets/${ticketId}/notes`, { note: newNote }, { withCredentials: true });
      toast.success('Note added successfully!');
      setNewNote('');
      setShowNotesModal(false);
      const updated = await api.get(`/admin/support/tickets/${ticketId}`, { withCredentials: true });
      if (updated.data?.ticket) {
        setSelectedTicket(updated.data.ticket);
      }
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add note');
    }
  };

  const handleDelete = async () => {
    if (!ticketToDelete) return;
    
    try {
      await api.delete(`/admin/support/tickets/${ticketToDelete}`, { withCredentials: true });
      toast.success('Ticket deleted successfully!');
      setShowDeleteModal(false);
      setTicketToDelete(null);
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const resetForm = () => {
    setFormData({ userId: '', subject: '', description: '', priority: 'medium' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'in_progress':
        return <Clock size={16} color="#f59e0b" />;
      default:
        return <AlertCircle size={16} color="#ef4444" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#eab308';
      default:
        return '#10b981';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
    ticket.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && tickets.length === 0) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <style>{`
        select option {
          background: ${colors.isDark ? '#1a1a2e' : '#ffffff'};
          color: ${colors.text};
        }
        select:focus {
          border-color: ${colors.accent};
          outline: none;
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>Support Tickets</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: colors.accent,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textSecondary,
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: '8px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tickets List */}
      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {filteredTickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  padding: '16px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  border: `1px solid ${getPriorityColor(ticket.priority)}40`,
                  cursor: 'pointer',
                }}
                onClick={async () => {
                  // Fetch full ticket details with messages
                  try {
                    const response = await api.get(`/admin/support/tickets/${ticket.id}`, {
                      withCredentials: true,
                    });
                    if (response.data?.ticket) {
                      setSelectedTicket(response.data.ticket);
                      // Mark as read
                      await markTicketAsRead(ticket.id);
                    } else {
                      setSelectedTicket(ticket);
                    }
                  } catch (error) {
                    console.error('Failed to fetch ticket details:', error);
                    setSelectedTicket(ticket);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {getStatusIcon(ticket.status)}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        User ID: {ticket.userId} • {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        background: `${getPriorityColor(ticket.priority)}20`,
                        color: getPriorityColor(ticket.priority),
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        background: `${colors.accent}20`,
                        color: colors.accent,
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '13px', marginTop: '8px' }}>
                  {ticket.description.substring(0, 150)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No support tickets found
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Create Support Ticket
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  User ID *
                </label>
                <input
                  type="number"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px',
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
              <div>
                <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: colors.text,
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: colors.accent,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              {selectedTicket.subject}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Description</div>
                <div style={{ color: colors.text, fontSize: '14px' }}>{selectedTicket.description}</div>
              </div>
              {selectedTicket.assignedTo && (
                <div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Assigned To</div>
                  <div style={{ color: colors.text, fontSize: '14px' }}>
                    Admin ID: {selectedTicket.assignedTo}
                  </div>
                </div>
              )}
              {/* Messages/Chat Interface */}
              {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                <div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                    Conversation
                  </div>
                  <div
                    style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      padding: '16px',
                      background: colors.isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    {selectedTicket.messages.map((msg: any, index: number) => (
                      <div
                        key={msg.id}
                        ref={(el) => {
                          if (index === selectedTicket.messages.length - 1) {
                            setMessagesEndRef(el as any);
                          }
                        }}
                        style={{
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.senderType === 'admin' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background:
                              msg.senderType === 'admin'
                                ? colors.accent
                                : colors.isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.05)',
                            color: msg.senderType === 'admin' ? 'white' : colors.text,
                          }}
                        >
                          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                            {msg.senderName} {msg.senderType === 'admin' && '(Support)'}
                          </div>
                          <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={(el) => setMessagesEndRef(el as any)} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
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
                    />
                    <button
                      onClick={async () => {
                        if (!newReply.trim()) return;
                        try {
                          setReplying(true);
                          const response = await api.post(
                            `/admin/support/tickets/${selectedTicket.id}/reply`,
                            { message: newReply },
                            { withCredentials: true }
                          );
                          if (response.data?.status === 'success') {
                            toast.success('Reply sent successfully');
                            setNewReply('');
                            const updated = await api.get(`/admin/support/tickets/${selectedTicket.id}`, {
                              withCredentials: true,
                            });
                            setSelectedTicket(updated.data.ticket);
                            fetchTickets();
                            setTimeout(() => scrollToBottom(), 100);
                          }
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || 'Failed to send reply');
                        } finally {
                          setReplying(false);
                        }
                      }}
                      disabled={replying || !newReply.trim()}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        background: replying ? colors.textSecondary : colors.accent,
                        color: 'white',
                        border: 'none',
                        cursor: replying ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        alignSelf: 'flex-end',
                      }}
                    >
                      {replying ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
              {selectedTicket.response && !selectedTicket.messages && (
                <div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Response</div>
                  <div style={{ color: colors.text, fontSize: '14px' }}>{selectedTicket.response}</div>
                </div>
              )}
              {selectedTicket.notes && selectedTicket.notes.length > 0 && (
                <div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>Internal Notes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedTicket.notes.map((note: any, index: number) => (
                      <div key={index} style={{
                        padding: '12px',
                        background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '6px',
                        border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: colors.text, fontSize: '12px', fontWeight: '500' }}>{note.adminName}</span>
                          <span style={{ color: colors.textSecondary, fontSize: '11px' }}>
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: colors.text, fontSize: '13px' }}>{note.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdate(selectedTicket.id, { status: e.target.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => handleUpdate(selectedTicket.id, { priority: e.target.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: colors.text,
                    fontSize: '14px',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  onClick={() => setShowAssignModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: colors.accent + '20',
                    color: colors.accent,
                    border: `1px solid ${colors.accent}40`,
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <UserPlus size={14} />
                  Assign
                </button>
                <button
                  onClick={() => setShowNotesModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: colors.accent + '20',
                    color: colors.accent,
                    border: `1px solid ${colors.accent}40`,
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={14} />
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setTicketToDelete(selectedTicket.id);
                    setShowDeleteModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowAssignModal(false)}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Assign Ticket
            </h3>
            <select
              value={assignToAdminId}
              onChange={(e) => setAssignToAdminId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: colors.text,
                fontSize: '14px',
                marginBottom: '16px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="">Select Admin</option>
              {admins.filter(a => a.isActive).map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.username} ({admin.role})
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignToAdminId('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(selectedTicket.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: colors.accent,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => {
            setShowNotesModal(false);
            setNewNote('');
          }}
        >
          <div
            style={{
              background: colors.isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Add Internal Note
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter internal note (only visible to admins)..."
              rows={5}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: colors.text,
                fontSize: '14px',
                marginBottom: '16px',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNewNote('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddNote(selectedTicket.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: colors.accent,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ticket Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTicketToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Support Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={false}
      />
    </div>
  );
};

export default SupportTickets;

