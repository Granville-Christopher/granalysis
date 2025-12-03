import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, Shield, ShieldOff } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tierFilter, setTierFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchUsers();
  }, [page, search, tierFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { search, page, limit: 50 };
      if (tierFilter) params.tier = tierFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/admin/users', {
        params,
        withCredentials: true,
      });
      console.log('[AdminUsers] Full response:', response);
      console.log('[AdminUsers] Response data:', response.data);
      
      // Handle both direct data and wrapped responses
      const data = response.data?.users ? response.data : (response.data || {});
      
      if (data.users || Array.isArray(data)) {
        setUsers(data.users || data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.warn('[AdminUsers] No users found in response:', data);
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      console.error('Error response:', error.response?.data);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number, updates: any) => {
    try {
      await api.patch(`/admin/users/${userId}`, updates, { withCredentials: true });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete}`, { withCredentials: true });
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await api.post('/admin/users/bulk-delete', { userIds: selectedUsers }, { withCredentials: true });
      setShowBulkDeleteModal(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = { search };
      if (tierFilter) params.tier = tierFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/admin/export/users', { params, withCredentials: true });
      const csv = convertToCSV(response.data.data);
      downloadCSV(csv, 'users.csv');
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && users.length === 0) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>Users Management</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
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
              Delete Selected ({selectedUsers.length})
            </button>
          )}
          <button
            onClick={handleExport}
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
            Export CSV
          </button>
        </div>
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
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          style={{
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
          <option value="" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            All Tiers
          </option>
          <option value="free" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Free
          </option>
          <option value="startup" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Startup
          </option>
          <option value="business" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Business
          </option>
          <option value="enterprise" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Enterprise
          </option>
        </select>
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
          }}
        >
          <option value="" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            All Statuses
          </option>
          <option value="active" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Active
          </option>
          <option value="locked" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Locked
          </option>
        </select>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Tier</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td style={{ padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{user.email}</td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{user.fullName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
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
                    </td>
                    <td style={{ padding: '12px' }}>
                      {user.accountLockedUntil ? (
                        <span style={{ color: '#ef4444', fontSize: '12px' }}>Locked</span>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '12px' }}>Active</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateUser(user.id, { emailVerified: !user.emailVerified });
                          }}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: colors.text,
                            cursor: 'pointer',
                          }}
                          title={user.emailVerified ? 'Unverify Email' : 'Verify Email'}
                        >
                          {user.emailVerified ? <Shield size={16} /> : <ShieldOff size={16} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user.id);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No users found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: page === 1 ? 'transparent' : colors.accent,
              color: page === 1 ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Previous
          </button>
          <span style={{ color: colors.text, fontSize: '14px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: page === totalPages ? 'transparent' : colors.accent,
              color: page === totalPages ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Users"
        message={`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />
    </div>
  );
};

export default AdminUsers;

