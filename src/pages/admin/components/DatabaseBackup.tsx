import React, { useState, useEffect } from 'react';
import { Database, Download, RotateCcw, Trash2, RefreshCw, AlertTriangle, Info, Eye } from 'lucide-react';
import api from '../../../utils/axios';
import { useTheme } from '../../../contexts/ThemeContext';
import { THEME_CONFIG } from '../../../components/home/theme';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import BackupContentsModal from '../../../components/admin/BackupContentsModal';

interface Backup {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
}

const DatabaseBackup: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContentsModal, setShowContentsModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [viewingBackup, setViewingBackup] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setFetching(true);
      const response = await api.get('/admin/backup/list', { withCredentials: true });
      if (response.data?.status === 'success') {
        setBackups(response.data.backups || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setFetching(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/backup/create', {}, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success('Backup created successfully!');
        setShowCreateModal(false);
        fetchBackups();
      } else {
        toast.error(response.data?.message || 'Failed to create backup');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create backup';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;

    try {
      setLoading(true);
      const response = await api.post('/admin/backup/restore', { filename: selectedBackup }, { withCredentials: true });
      if (response.data?.status === 'success') {
        toast.success('Backup restored successfully! The system may need to restart.');
        setShowRestoreModal(false);
        setSelectedBackup(null);
        setRestoreConfirm(null);
      } else {
        toast.error(response.data?.message || 'Failed to restore backup');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to restore backup';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBackup) return;

    try {
      await api.delete(`/admin/backup/${selectedBackup}`, { withCredentials: true });
      toast.success('Backup deleted successfully!');
      setShowDeleteModal(false);
      setSelectedBackup(null);
      fetchBackups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete backup';
      toast.error(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={28} color={colors.accent} />
          <h1 style={{ color: colors.text, fontSize: '24px', fontWeight: '600' }}>Database Backup & Restore</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchBackups}
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
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: colors.accent,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
            }}
          >
            <Download size={18} />
            Create Backup
          </button>
        </div>
      </div>

      {fetching && backups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
          Loading backups...
        </div>
      ) : backups.length === 0 ? (
        <div style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}>
          <Database size={48} color={colors.textSecondary} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: colors.textSecondary, fontSize: '16px' }}>No backups found</p>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Create your first backup to get started
          </p>
        </div>
      ) : (
        <div style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                <th style={{ padding: '16px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Filename</th>
                <th style={{ padding: '16px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Size</th>
                <th style={{ padding: '16px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Created</th>
                <th style={{ padding: '16px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Backup Contents</th>
                <th style={{ padding: '16px', textAlign: 'right', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup, index) => (
                <tr key={backup.filename} style={{ borderBottom: index < backups.length - 1 ? `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` : 'none' }}>
                  <td style={{ padding: '16px', color: colors.text, fontSize: '14px' }}>{backup.filename}</td>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>
                    {formatFileSize(backup.size)}
                  </td>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '14px' }}>
                    {formatDate(backup.createdAt)}
                  </td>
                  <td style={{ padding: '16px', color: colors.textSecondary, fontSize: '13px' }}>
                    <button
                      onClick={() => {
                        setViewingBackup(backup.filename);
                        setShowContentsModal(true);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(79, 163, 255, 0.1)',
                        border: `1px solid ${colors.accent}`,
                        borderRadius: '6px',
                        color: colors.accent,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                      }}
                    >
                      <Eye size={14} />
                      View Contents
                    </button>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setSelectedBackup(backup.filename);
                          setShowRestoreModal(true);
                        }}
                        disabled={loading}
                        style={{
                          padding: '6px 12px',
                          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '12px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBackup(backup.filename);
                          setShowDeleteModal(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          borderRadius: '6px',
                          color: '#ef4444',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Backup Modal */}
      <ConfirmationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateBackup}
        title="Create Database Backup"
        message="This will create a complete backup of the database including all users, files, payments, support tickets, and system settings.\n\nThis may take a few moments depending on database size."
        confirmText="Create Backup"
        cancelText="Cancel"
        variant="info"
        isLoading={loading}
      />

      {/* Restore Backup Modal */}
      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedBackup(null);
        }}
        onConfirm={handleRestore}
        title="Restore Database Backup"
        message={`WARNING: Restoring from "${selectedBackup}" will DELETE ALL CURRENT DATA and replace it with the backup.\n\nThis includes:\n• All users and accounts\n• All uploaded files\n• All payment records\n• All support tickets\n• All system settings\n\nThis action cannot be undone. Are you absolutely sure?`}
        confirmText="Yes, Restore Backup"
        cancelText="Cancel"
        variant="danger"
        isLoading={loading}
      />

      {/* Delete Backup Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBackup(null);
        }}
        onConfirm={handleDelete}
        title="Delete Backup"
        message={`Are you sure you want to delete backup "${selectedBackup}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={false}
      />

      {/* Backup Contents Modal */}
      <BackupContentsModal
        isOpen={showContentsModal}
        onClose={() => {
          setShowContentsModal(false);
          setViewingBackup(null);
        }}
        filename={viewingBackup || ''}
      />
    </div>
  );
};

export default DatabaseBackup;

