import React, { useState } from 'react';
import { User, LogIn, AlertTriangle } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const UserImpersonation: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const handleImpersonate = async () => {
    if (!userId || !userId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/admin/impersonate/${userId}`, {}, { withCredentials: true });
      if (response.data?.status === 'success') {
        // Store impersonation token and redirect to user dashboard
        sessionStorage.setItem('impersonationToken', response.data.impersonationToken);
        sessionStorage.setItem('impersonatedUserId', userId);
        toast.success(`Impersonating user ${userId}. You will be redirected to their dashboard.`);
        // Redirect to user dashboard with impersonation token
        window.location.href = `/dashboard?impersonate=${response.data.impersonationToken}`;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to impersonate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <AlertTriangle size={20} color="#ef4444" />
        <div style={{ color: colors.text, fontSize: '14px' }}>
          <strong>Warning:</strong> User impersonation allows you to view the dashboard as another user. Use this feature responsibly.
        </div>
      </div>

      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        User Impersonation
      </h1>

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '30px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          maxWidth: '500px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              User ID
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID to impersonate"
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
          <button
            onClick={handleImpersonate}
            disabled={loading || !userId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              background: loading || !userId ? 'rgba(79, 163, 255, 0.5)' : colors.accent,
              color: 'white',
              border: 'none',
              cursor: loading || !userId ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <LogIn size={18} />
            {loading ? 'Impersonating...' : 'Impersonate User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserImpersonation;

