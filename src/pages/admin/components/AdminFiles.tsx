import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Download } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const AdminFiles: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;


  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/files', { params: { page, limit: 50 }, withCredentials: true });
      console.log('[AdminFiles] Full response:', response);
      console.log('[AdminFiles] Response data:', response.data);
      
      // Handle both direct data and wrapped responses
      const data = response.data?.files ? response.data : (response.data || {});
      
      if (data.files || Array.isArray(data)) {
        setFiles(data.files || data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.warn('[AdminFiles] No files found in response:', data);
        setFiles([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Failed to fetch files:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load files');
      setFiles([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [page]);

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await api.post('/admin/files/bulk-delete', { fileIds: selectedFiles }, { withCredentials: true });
      setShowBulkDeleteModal(false);
      setSelectedFiles([]);
      fetchFiles();
      toast.success('Files deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete files');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/files', { withCredentials: true });
      const csv = convertToCSV(response.data.data);
      downloadCSV(csv, 'files.csv');
      toast.success('Files exported successfully!');
    } catch (error) {
      console.error('Failed to export files:', error);
      toast.error('Failed to export files');
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

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      await api.delete(`/admin/files/${fileToDelete}`, { withCredentials: true });
      setShowDeleteModal(false);
      setFileToDelete(null);
      fetchFiles();
      toast.success('File deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    }
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>
          Files Management
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedFiles.length > 0 && (
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
              Delete Selected ({selectedFiles.length})
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

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {files.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === files.length && files.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(files.map(f => f.id));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>File Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Size</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: colors.text, fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.id}
                    style={{
                      borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/admin/files/${file.id}`)}
                  >
                    <td style={{ padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles([...selectedFiles, file.id]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{file.originalName}</td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{file.mimeType}</td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td style={{ padding: '12px', color: colors.text, fontSize: '14px' }}>{file.status}</td>
                    <td style={{ padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/api/v1/files/${file.id}/download`, '_blank');
                          }}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: colors.accent,
                            cursor: 'pointer',
                          }}
                          title="Download File"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file.id);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                          title="Delete File"
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
            No files found
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

      {/* Delete File Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={false}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Files"
        message={`Are you sure you want to delete ${selectedFiles.length} file(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={false}
      />
    </div>
  );
};

export default AdminFiles;

