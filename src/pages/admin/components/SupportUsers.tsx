import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Shield, ShieldOff, Lock, Unlock } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const SupportUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [userToLock, setUserToLock] = useState<number | null>(null);
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/support/users', {
        params: { search, limit: 100 },
        withCredentials: true,
      });
      if (response.data?.status === 'success') {
        setUsers(response.data.users || []);
      } else if (response.data?.status === 'error') {
        console.error('Error fetching users:', response.data.message);
        toast.error(response.data.message || 'Failed to load support users');
        setUsers([]);
      } else if (response.data) {
        // Fallback for old response format
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch support users:', error);
      toast.error('Failed to load support users');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async () => {
    if (!userToLock) return;
    try {
      await api.post(`/admin/users/${userToLock}/lock`, {}, { withCredentials: true });
      toast.success('User account locked successfully');
      setShowLockModal(false);
      setUserToLock(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to lock user');
    }
  };

  const handleUnlockUser = async (userId: number) => {
    try {
      await api.post(`/admin/users/${userId}/unlock`, {}, { withCredentials: true });
      toast.success('User account unlocked successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unlock user');
    }
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Support Users
      </h1>

      <div style={{ position: 'relative', width: '300px', marginBottom: '20px' }}>
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
          onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
          placeholder="Search users..."
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

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {users.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  padding: '16px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `${colors.accent}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Users size={20} color={colors.accent} />
                  </div>
                  <div>
                    <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                      {user.fullName || user.email}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user.accountLockedUntil ? (
                    <span style={{ color: '#ef4444', fontSize: '12px' }}>Locked</span>
                  ) : (
                    <span style={{ color: '#10b981', fontSize: '12px' }}>Active</span>
                  )}
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
                    {user.tier || 'free'}
                  </span>
                  {user.accountLockedUntil ? (
                    <button
                      onClick={() => handleUnlockUser(user.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                      }}
                      title="Unlock User"
                    >
                      <Unlock size={14} />
                      Unlock
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUserToLock(user.id);
                        setShowLockModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                      }}
                      title="Lock User"
                    >
                      <Lock size={14} />
                      Lock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No users needing support found
          </div>
        )}
      </div>

      {/* Lock User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLockModal}
        onClose={() => {
          setShowLockModal(false);
          setUserToLock(null);
        }}
        onConfirm={handleLockUser}
        title="Lock User Account"
        message="Are you sure you want to lock this user account? They will not be able to log in until the account is unlocked."
        confirmText="Lock Account"
        cancelText="Cancel"
        variant="warning"
        isLoading={false}
      />
    </div>
  );
};

export default SupportUsers;

