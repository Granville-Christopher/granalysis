import React, { useState, useEffect } from 'react';
import { Users, X, LogOut, RefreshCw, Shield } from 'lucide-react';
import api from '../../../utils/axios';
import { useTheme } from '../../../contexts/ThemeContext';
import { THEME_CONFIG } from '../../../components/home/theme';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

interface Session {
  sessionId: string;
  userId: number;
  userType: string;
  createdAt: Date;
  lastAccess: Date;
  ipAddress?: string;
}

const SessionManagement: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [adminSessions, setAdminSessions] = useState<Session[]>([]);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [adminToRevokeAll, setAdminToRevokeAll] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setFetching(true);
      const response = await api.get('/admin/sessions', { withCredentials: true });
      if (response.data?.status === 'success') {
        setSessions(response.data.sessions || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setFetching(false);
    }
  };

  const fetchAdminSessions = async (adminId: number) => {
    try {
      const response = await api.get(`/admin/sessions/admin/${adminId}`, { withCredentials: true });
      if (response.data?.status === 'success') {
        setAdminSessions(response.data.sessions || []);
        setSelectedAdminId(adminId);
      }
    } catch (error: any) {
      toast.error('Failed to load admin sessions');
    }
  };

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;

    try {
      setLoading(true);
      const response = await api.delete(`/admin/sessions/${sessionToRevoke}`, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success('Session revoked successfully');
        setShowRevokeModal(false);
        setSessionToRevoke(null);
        fetchSessions();
        if (selectedAdminId) {
          fetchAdminSessions(selectedAdminId);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to revoke session';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAllAdminSessions = async () => {
    if (!adminToRevokeAll) return;

    try {
      setLoading(true);
      const response = await api.post(`/admin/sessions/admin/${adminToRevokeAll}/revoke-all`, {}, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success(`${response.data.revoked || 0} sessions revoked successfully`);
        setShowRevokeAllModal(false);
        setAdminToRevokeAll(null);
        fetchSessions();
        setSelectedAdminId(null);
        setAdminSessions([]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to revoke sessions';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'super_admin':
        return '#8b5cf6';
      case 'admin':
        return '#3b82f6';
      case 'support_admin':
        return '#10b981';
      default:
        return colors.textSecondary;
    }
  };

  // Group sessions by user
  const groupedSessions = sessions.reduce((acc, session) => {
    const key = `${session.userId}-${session.userType}`;
    if (!acc[key]) {
      acc[key] = {
        userId: session.userId,
        userType: session.userType,
        sessions: [],
      };
    }
    acc[key].sessions.push(session);
    return acc;
  }, {} as Record<string, { userId: number; userType: string; sessions: Session[] }>);

  const groupedArray = Object.values(groupedSessions);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={28} color={colors.accent} />
          <h1 style={{ color: colors.text, fontSize: '24px', fontWeight: '600' }}>Session Management</h1>
        </div>
        <button
          onClick={fetchSessions}
          disabled={fetching}
          style={{
            padding: '10px 20px',
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '8px',
            color: colors.text,
            cursor: fetching ? 'not-allowed' : 'pointer',
            opacity: fetching ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={18} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {fetching && sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}>
          <Users size={48} color={colors.textSecondary} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: colors.textSecondary, fontSize: '16px' }}>No active sessions</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groupedArray.map((group) => (
            <div
              key={`${group.userId}-${group.userType}`}
              style={{
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '12px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '16px',
                background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getUserTypeColor(group.userType),
                  }} />
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    User ID: {group.userId} ({group.userType})
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '4px',
                    color: colors.textSecondary,
                    fontSize: '12px',
                  }}>
                    {group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {(group.userType === 'admin' || group.userType === 'super_admin') && (
                  <button
                    onClick={() => {
                      if (selectedAdminId === group.userId) {
                        setSelectedAdminId(null);
                        setAdminSessions([]);
                      } else {
                        fetchAdminSessions(group.userId);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '6px',
                      color: colors.text,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedAdminId === group.userId ? 'Hide Details' : 'View Details'}
                  </button>
                )}
                {(group.userType === 'admin' || group.userType === 'super_admin') && (
                  <button
                    onClick={() => {
                      setAdminToRevokeAll(group.userId);
                      setShowRevokeAllModal(true);
                    }}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginLeft: '8px',
                    }}
                  >
                    <LogOut size={14} />
                    Revoke All
                  </button>
                )}
              </div>

              {selectedAdminId === group.userId && adminSessions.length > 0 && (
                <div style={{ padding: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px' }}>Session ID</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px' }}>Created</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px' }}>Last Access</th>
                        <th style={{ padding: '8px', textAlign: 'right', color: colors.textSecondary, fontSize: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminSessions.map((session, index) => (
                        <tr key={session.sessionId} style={{ borderTop: index > 0 ? `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` : 'none' }}>
                          <td style={{ padding: '8px', color: colors.text, fontSize: '12px', fontFamily: 'monospace' }}>
                            {session.sessionId.substring(0, 20)}...
                          </td>
                          <td style={{ padding: '8px', color: colors.textSecondary, fontSize: '12px' }}>
                            {formatDate(session.createdAt)}
                          </td>
                          <td style={{ padding: '8px', color: colors.textSecondary, fontSize: '12px' }}>
                            {formatDate(session.lastAccess)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setSessionToRevoke(session.sessionId);
                                setShowRevokeModal(true);
                              }}
                              disabled={loading}
                              style={{
                                padding: '4px 8px',
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '11px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {group.sessions.length > 0 && selectedAdminId !== group.userId && (
                <div style={{ padding: '16px', borderTop: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.sessions.slice(0, 3).map((session) => (
                      <div key={session.sessionId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '6px',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: colors.text, fontSize: '12px', fontFamily: 'monospace' }}>
                            {session.sessionId.substring(0, 30)}...
                          </span>
                          <span style={{ color: colors.textSecondary, fontSize: '11px' }}>
                            Last access: {formatDate(session.lastAccess)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSessionToRevoke(session.sessionId);
                            setShowRevokeModal(true);
                          }}
                          disabled={loading}
                          style={{
                            padding: '4px 8px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '11px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                    {group.sessions.length > 3 && (
                      <div style={{ color: colors.textSecondary, fontSize: '12px', textAlign: 'center', padding: '8px' }}>
                        + {group.sessions.length - 3} more session{group.sessions.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Revoke Session Modal */}
      <ConfirmationModal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setSessionToRevoke(null);
        }}
        onConfirm={handleRevokeSession}
        title="Revoke Session"
        message="Are you sure you want to revoke this session? The user will be logged out from this device."
        confirmText="Revoke Session"
        cancelText="Cancel"
        variant="warning"
        isLoading={loading}
      />

      {/* Revoke All Sessions Modal */}
      <ConfirmationModal
        isOpen={showRevokeAllModal}
        onClose={() => {
          setShowRevokeAllModal(false);
          setAdminToRevokeAll(null);
        }}
        onConfirm={handleRevokeAllAdminSessions}
        title="Revoke All Sessions"
        message="Are you sure you want to revoke ALL sessions for this admin? They will be logged out from all devices."
        confirmText="Revoke All"
        cancelText="Cancel"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
};

export default SessionManagement;

