import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Mail, User, Building, Phone, Shield, Calendar } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { toast } from '../../../utils/toast';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const colors = THEME_CONFIG.dark;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    pricingTier: '',
    emailVerified: false,
    accountLockedUntil: null as Date | null,
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`, { withCredentials: true });
      if (response.data) {
        setUser(response.data.user);
        setStats(response.data.stats);
        setFormData({
          fullName: response.data.user.fullName || '',
          email: response.data.user.email || '',
          companyName: response.data.user.companyName || '',
          phone: response.data.user.phone || '',
          pricingTier: response.data.user.tier || 'free',
          emailVerified: response.data.user.emailVerified || false,
          accountLockedUntil: response.data.user.accountLockedUntil || null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch(`/admin/users/${id}`, {
        tier: formData.pricingTier,
        emailVerified: formData.emailVerified,
        accountLockedUntil: formData.accountLockedUntil,
      }, { withCredentials: true });
      toast.success('User updated successfully!');
      setEditing(false);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>User not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>
          User Details
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* User Info Card */}
        <div
          style={{
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            User Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Full Name
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{user.fullName || 'N/A'}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Email
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{user.email}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Company Name
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{user.companyName || 'N/A'}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Phone
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{user.phone || 'N/A'}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Created At
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>
                {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Last Activity
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>
                {user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div
          style={{
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Statistics
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Files</div>
              <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                {stats?.fileCount || 0}
              </div>
            </div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Storage Used</div>
              <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                {stats?.totalStorage ? (stats.totalStorage / 1024 / 1024).toFixed(2) : '0'} MB
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600' }}>Edit User</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: colors.accent,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchUser();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
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
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: colors.accent,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Pricing Tier
              </label>
              <select
                value={formData.pricingTier}
                onChange={(e) => setFormData({ ...formData, pricingTier: e.target.value })}
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
                }}
              >
                <option value="free">Free</option>
                <option value="startup">Startup</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.emailVerified}
                  onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                Email Verified
              </label>
            </div>
            <div>
              <label style={{ color: colors.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Account Locked Until (leave empty to unlock)
              </label>
              <input
                type="datetime-local"
                value={formData.accountLockedUntil ? new Date(formData.accountLockedUntil).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, accountLockedUntil: e.target.value ? new Date(e.target.value) : null })}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;

