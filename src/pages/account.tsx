import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { ArrowLeft, User, CreditCard, Settings, Calendar, XCircle, Edit2, Save, X, Mail, Building, Phone, Briefcase } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { THEME_CONFIG, getGlassmorphismClass } from '../components/home/theme';
import Header from '../components/dashboard-components/Header';
import Sidebar from '../components/dashboard-components/Sidebar';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toggling2FA, setToggling2FA] = useState(false);

  const handleToggle2FA = async () => {
    if (!user || toggling2FA) return;
    setError('');
    setSuccess('');
    setToggling2FA(true);
    const original = !!user.twoFactorEnabled;
    const desired = !original;
    // Optimistic UI
    setUser({ ...user, twoFactorEnabled: desired });
    try {
      const endpoint = desired ? '/auth/2fa/enable' : '/auth/2fa/disable';
      const res = await api.post(endpoint, {});
      if (res.data?.status === 'success') {
        // Use returned user directly to avoid extra round-trip
        const returnedUser = res.data.user;
        if (returnedUser) {
          setUser(returnedUser);
          try {
            sessionStorage.setItem('userData', JSON.stringify(returnedUser));
          } catch {}
        }
        const nowEnabled = returnedUser ? !!returnedUser.twoFactorEnabled : desired;
        setSuccess(nowEnabled ? '2FA enabled. You will be asked for a code on next login.' : '2FA disabled.');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.data?.message || 'Failed to toggle 2FA');
        setUser({ ...user, twoFactorEnabled: original });
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to toggle 2FA');
      setUser({ ...user, twoFactorEnabled: original });
    } finally {
      setToggling2FA(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      // Always fetch fresh data directly from database
      try {
        const res = await api.get('/auth/me');
        if (res.data?.status === 'success') {
          const userData = res.data.user;
          console.log('[Account] Fresh user data fetched from DB:', { 
            id: userData.id, 
            email: userData.email, 
            pricingTier: userData.pricingTier,
            accountBalance: userData.accountBalance,
            subscriptionExpiresAt: userData.subscriptionExpiresAt
          });
          setUser(userData);
          
          // Update sessionStorage with fresh data
          sessionStorage.setItem('userData', JSON.stringify(userData));
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        // Retry once after a short delay to avoid transient cookie timing issues
        try {
          await new Promise(resolve => setTimeout(resolve, 400));
          const res2 = await api.get('/auth/me');
          if (res2.data?.status === 'success') {
            const userData = res2.data.user;
            setUser(userData);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            setLoading(false);
            return;
          }
        } catch {}
        console.error('[Account] Failed to fetch fresh user data:', error);
        // Try stored data as last resort
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('[Account] Using stored user data as fallback:', { id: userData.id, email: userData.email });
            setUser(userData);
          } catch (err) {
            console.error('[Account] Failed to parse stored user data:', err);
            sessionStorage.removeItem('userData');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Background refresh to correct any stale fallback after initial render
    const bg = setTimeout(async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.status === 'success') {
          const fresh = res.data.user;
          setUser((prev: any) => {
            // Only update if changed (notably twoFactorEnabled)
            if (!prev || prev.twoFactorEnabled !== fresh.twoFactorEnabled) {
              try { sessionStorage.setItem('userData', JSON.stringify(fresh)); } catch {}
              return fresh;
            }
            return prev;
          });
        }
      } catch {}
    }, 1000);

    return () => clearTimeout(bg);
  }, []);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post('/payment/cancel', {});
      if (res.data?.status === 'success') {
        // Wait a bit for database to be updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch fresh user data directly from database (not from cache)
        const userRes = await api.get('/auth/me');
        if (userRes.data?.status === 'success') {
          const updatedUser = userRes.data.user;
          console.log('[Account] Fresh user data after cancellation:', { 
            subscriptionStatus: updatedUser.subscriptionStatus,
            pricingTier: updatedUser.pricingTier 
          });
          
          // Force update user state immediately
          setUser(updatedUser);
          
          // Update sessionStorage with fresh data
          sessionStorage.setItem('userData', JSON.stringify(updatedUser));
          
          // Show success message
          setSuccess('Subscription cancelled successfully. You will retain access until the end of your billing period.');
          setTimeout(() => setSuccess(''), 5000);
          
          // Verify the status was updated
          if (updatedUser.subscriptionStatus === 'cancelled') {
            console.log('[Account] Subscription status confirmed as cancelled');
          } else {
            console.warn('[Account] Subscription status not updated to cancelled:', updatedUser.subscriptionStatus);
          }
        } else {
          alert('Subscription cancelled, but failed to refresh user data. Please refresh the page.');
        }
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditing(field);
    setEditValues({ [field]: user[field] || '' });
    setError('');
    setSuccess('');
    setShowVerification(false);
    setCodeSent(false);
    setVerificationCode('');
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditValues({});
    setError('');
    setSuccess('');
    setShowVerification(false);
    setCodeSent(false);
    setVerificationCode('');
  };

  const handleSendVerificationCode = async (field: string) => {
    try {
      setError('');
      const res = await api.post(
        '/users/send-verification-code',
        field === 'email' ? { newEmail: editValues[field] } : {}
      );
      if (res.data?.status === 'success') {
        setCodeSent(true);
        setShowVerification(true);
        setSuccess('Verification code sent to your email');
      } else {
        setError(res.data?.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send verification code');
    }
  };

  const handleSave = async (field: string) => {
    if (field === 'email' && !showVerification) {
      // For email, need to send verification code first
      if (!editValues[field] || editValues[field] === user.email) {
        setError('Please enter a new email address');
        return;
      }
      await handleSendVerificationCode(field);
      return;
    }

    if (field === 'email' && showVerification && !verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (field === 'email' && showVerification) {
        // Verify code and update email
        const res = await api.post(
          '/users/verify-code-and-update',
          { code: verificationCode, newEmail: editValues[field] }
        );
        if (res.data?.status === 'success') {
          setUser(res.data.user);
          setEditing(null);
          setSuccess('Email updated successfully');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(res.data?.message || 'Failed to update email');
        }
      } else {
        // For other fields, update directly
        const updateData: any = {};
        updateData[field] = editValues[field];

        const res = await api.put('/users/profile', updateData);
        if (res.data?.status === 'success') {
          setUser(res.data.user);
          setEditing(null);
          setSuccess(`${field === 'fullName' ? 'Name' : field === 'companyName' ? 'Company' : field === 'phone' ? 'Phone' : 'Business Type'} updated successfully`);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(res.data?.message || `Failed to update ${field}`);
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to update ${field}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value: any) => {
    if (value === undefined || value === null) return 'N/A';

    try {
      let date: Date | null = null;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'number') {
        // Heuristic: treat small numbers as seconds, large as milliseconds
        const ms = value < 1e12 ? value * 1000 : value;
        date = new Date(ms);
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return 'N/A';
        // If string is just digits, treat as epoch (sec or ms)
        if (/^\d+$/.test(trimmed)) {
          const num = parseInt(trimmed, 10);
          const ms = num < 1e12 ? num * 1000 : num;
          date = new Date(ms);
        } else {
          date = new Date(trimmed);
        }
      } else if (typeof value === 'object') {
        // Handle common timestamp shapes, e.g. { seconds, nanoseconds } or { _seconds }
        const seconds = value.seconds ?? value._seconds;
        const milliseconds = value.milliseconds ?? value.ms ?? value._milliseconds;
        if (typeof milliseconds === 'number') {
          date = new Date(milliseconds);
        } else if (typeof seconds === 'number') {
          date = new Date(seconds * 1000);
        } else if (typeof value.toString === 'function') {
          const asString = String(value);
          if (asString && asString !== '[object Object]') {
            const parsed = new Date(asString);
            if (!isNaN(parsed.getTime())) date = parsed;
          }
        }
      }

      if (!date || isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatTextValue = (value?: string | null) => {
    if (!value) return 'N/A';
    if (typeof value === 'string' && value.trim().length === 0) return 'N/A';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className={colors.text}>Loading...</div>
      </div>
    );
  }

  const renderEditableField = (field: string, label: string, icon: React.ReactNode, type: string = 'text') => {
    const isEditing = editing === field;
    const value = isEditing ? editValues[field] : (user?.[field] || 'N/A');

    return (
      <div>
        <p className={`text-sm ${colors.textSecondary} mb-1 flex items-center gap-2`}>
          {icon}
          {label}
        </p>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type={type}
              value={editValues[field] || ''}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${colors.isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {field === 'email' && showVerification && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder="Enter verification code"
                  maxLength={6}
                />
                <p className={`text-xs ${colors.textSecondary}`}>
                  Enter the 6-digit code sent to {editValues[field]}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(field)}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: colors.text,
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className={`text-lg font-semibold ${colors.text}`}>{value}</p>
            <button
              onClick={() => handleEdit(field)}
              className={`p-1.5 rounded-lg transition-all hover:opacity-80`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }}
              title={`Edit ${label}`}
            >
              <Edit2 className="w-4 h-4" style={{ color: colors.accent }} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <Header user={user} />
      <Sidebar
        isSidebarOpen={false}
        setIsSidebarOpen={() => {}}
        refreshKey={0}
        user={user}
      />
      <div className="md:ml-64 p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg ${colors.text} hover:opacity-80 transition-opacity`}
              style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={`text-3xl font-bold ${colors.text}`}>Account Settings</h1>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className={`mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 ${colors.text}`}>
              {success}
            </div>
          )}
          {error && (
            <div className={`mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 ${colors.text}`}>
              {error}
            </div>
          )}

          {/* Account Information */}
          <div
            className={`${glassmorphismClass} p-6 mb-6 rounded-xl`}
            style={{
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: colors.cardShadow,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <User className={`w-6 h-6 ${colors.text}`} />
              <h2 className={`text-xl font-semibold ${colors.text}`}>Account Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderEditableField('fullName', 'Full Name', <User className="w-4 h-4" />)}
              {renderEditableField('email', 'Email', <Mail className="w-4 h-4" />, 'email')}
              {renderEditableField('companyName', 'Company', <Building className="w-4 h-4" />)}
              {renderEditableField('phone', 'Phone', <Phone className="w-4 h-4" />, 'tel')}
              {renderEditableField('businessType', 'Business Type', <Briefcase className="w-4 h-4" />)}
              <div>
                <p className={`text-sm ${colors.textSecondary} mb-1 flex items-center gap-2`}>
                  <Calendar className="w-4 h-4" />
                  Account Created
                </p>
                <p className={`text-lg font-semibold ${colors.text}`}>
                  {formatDate(user?.createdAt)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Two-Factor Authentication (2FA)</p>
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-semibold ${colors.text}`}>
                    {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {/* Toggle switch */}
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    disabled={toggling2FA}
                    aria-pressed={!!user?.twoFactorEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${user?.twoFactorEnabled ? 'bg-green-500' : (colors.isDark ? 'bg-white/20' : 'bg-gray-300')}`}
                    title={user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${user?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div
            className={`${glassmorphismClass} p-6 mb-6 rounded-xl`}
            style={{
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: colors.cardShadow,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className={`w-6 h-6 ${colors.text}`} />
              <h2 className={`text-xl font-semibold ${colors.text}`}>Subscription</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Current Plan</p>
                <p className={`text-lg font-semibold ${colors.text}`}>
                  {formatTextValue(user?.pricingTier)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Status</p>
                <p className={`text-lg font-semibold ${colors.text}`}>
                  {formatTextValue(user?.subscriptionStatus)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Expires</p>
                <p className={`text-lg font-semibold ${colors.text}`}>
                  {formatDate(user?.subscriptionExpiresAt)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Next Billing</p>
                <p className={`text-lg font-semibold ${colors.text}`}>
                  {formatDate(user?.nextBillingDate)}
                </p>
              </div>
              {user?.trialExpiresAt && (
                <div>
                  <p className={`text-sm ${colors.textSecondary} mb-1`}>Trial Expires</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    {formatDate(user?.trialExpiresAt)}
                  </p>
                </div>
              )}
              {user?.accountBalance && user.accountBalance > 0 && (
                <div className="md:col-span-2">
                  <p className={`text-sm ${colors.textSecondary} mb-1`}>Account Balance</p>
                  <p className={`text-lg font-semibold text-green-500`}>
                    ${parseFloat(user.accountBalance.toString()).toFixed(2)}
                  </p>
                  <p className={`text-xs ${colors.textSecondary} mt-1 flex items-center gap-1`}>
                    <span>Credit from downgrade. Contact admin for refund.</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => navigate('/pricing')}
                className="px-6 py-2 rounded-lg font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                }}
              >
                {user?.subscriptionStatus === 'free' || !user?.subscriptionStatus ? 'Upgrade Plan' : 'Change Plan'}
              </button>
              <button
                onClick={() => navigate('/payment-history')}
                className="px-6 py-2 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: colors.text,
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                Payment History
              </button>
              {(user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'cancelled') && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling || user?.subscriptionStatus === 'cancelled'}
                  className="px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  style={
                    user?.subscriptionStatus === 'cancelled'
                      ? {
                          backgroundColor: colors.isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          color: colors.isDark ? '#9ca3af' : '#6b7280',
                          border: `1px solid ${colors.isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`,
                          cursor: 'not-allowed',
                        }
                      : {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }
                  }
                >
                  <XCircle className="w-4 h-4" />
                  {user?.subscriptionStatus === 'cancelled'
                    ? 'Subscription Cancelled'
                    : cancelling
                    ? 'Cancelling...'
                    : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
