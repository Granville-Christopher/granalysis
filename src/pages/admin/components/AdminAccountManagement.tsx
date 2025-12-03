import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Power, Shield, User, Search, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

interface AdminAccount {
  id: number;
  username: string;
  role: 'admin' | 'support_admin';
  fullName?: string;
  description?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  createdBy?: number;
}

const AdminAccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordAccountId, setResetPasswordAccountId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<number | null>(null);
  const [deleteAccountUsername, setDeleteAccountUsername] = useState<string | null>(null);
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin' as 'admin' | 'support_admin',
    fullName: '',
    description: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/accounts', { withCredentials: true });
      if (response.data?.status === 'success') {
        setAccounts(response.data.admins || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch admin accounts:', error);
      toast.error('Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      toast.error('Username and password are required');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await api.post('/admin/accounts', formData, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success('Admin account created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchAccounts();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create admin account';
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await api.put(`/admin/accounts/${id}/toggle-active`, {}, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success(`Admin account ${response.data.admin.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchAccounts();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update admin account';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deleteAccountId || !deleteAccountUsername) return;

    try {
      const response = await api.delete(`/admin/accounts/${deleteAccountId}`, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success('Admin account deleted successfully!');
        setShowDeleteModal(false);
        setDeleteAccountId(null);
        setDeleteAccountUsername(null);
        fetchAccounts();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete admin account';
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordAccountId || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await api.put(
        `/admin/accounts/${resetPasswordAccountId}/reset-password`,
        { newPassword },
        { withCredentials: true }
      );
      if (response.data?.status === 'success') {
        toast.success('Password reset successfully!');
        setShowResetPasswordModal(false);
        setResetPasswordAccountId(null);
        setNewPassword('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'admin',
      fullName: '',
      description: '',
    });
    setEditingAccount(null);
  };

  const filteredAccounts = accounts.filter((account) =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: colors.text }}>
        Loading admin accounts...
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Admin Account Management
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Create and manage admin and support admin accounts
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 4px 15px ${colors.accent}40`,
          }}
        >
          <UserPlus size={18} />
          Create Admin Account
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username or name..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
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

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          overflow: 'hidden',
        }}
      >
        {filteredAccounts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: colors.textSecondary }}>
            {searchTerm ? 'No accounts found matching your search.' : 'No admin accounts yet. Create one to get started.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Username</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: colors.textSecondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Created</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: colors.textSecondary, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    style={{
                      borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                    }}
                  >
                    <td style={{ padding: '16px', color: colors.text, fontWeight: '500' }}>{account.username}</td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background:
                            account.role === 'admin'
                              ? `rgba(79, 163, 255, 0.2)`
                              : `rgba(139, 92, 246, 0.2)`,
                          color:
                            account.role === 'admin'
                              ? colors.accent
                              : '#8b5cf6',
                        }}
                      >
                        {account.role === 'admin' ? <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <User size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                        {account.role === 'admin' ? 'Admin' : 'Support Admin'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: colors.textSecondary }}>{account.fullName || '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: account.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: account.isActive ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '12px' }}>
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleActive(account.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            color: colors.text,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={account.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteAccountId(account.id);
                            setDeleteAccountUsername(account.username);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: `1px solid rgba(239, 68, 68, 0.3)`,
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <>
          {/* Theme-aware styles for select options */}
          <style>
            {`
              select option {
                background: ${colors.isDark ? 'rgba(11, 27, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)'} !important;
                color: ${colors.text} !important;
              }
              select:focus {
                border-color: ${colors.accent} !important;
              }
            `}
          </style>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            <div
              style={{
                background: colors.isDark ? 'rgba(11, 27, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderRadius: '16px',
                padding: '30px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Create Admin Account
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
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
                  placeholder="admin_username"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
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
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'support_admin' })}
                  required
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
                  <option 
                    value="admin"
                    style={{
                      background: colors.isDark ? 'rgba(11, 27, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      color: colors.text,
                    }}
                  >
                    Admin
                  </option>
                  <option 
                    value="support_admin"
                    style={{
                      background: colors.isDark ? 'rgba(11, 27, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      color: colors.text,
                    }}
                  >
                    Support Admin
                  </option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
                  placeholder="Optional notes about this admin account"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={handleCreate}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Create Account
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: colors.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteAccountId(null);
          setDeleteAccountUsername(null);
        }}
        onConfirm={handleDelete}
        title="Delete Admin Account"
        message={deleteAccountUsername ? `Are you sure you want to delete admin account "${deleteAccountUsername}"? This action cannot be undone.` : 'Are you sure you want to delete this admin account? This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />
    </div>
  );
};

export default AdminAccountManagement;

