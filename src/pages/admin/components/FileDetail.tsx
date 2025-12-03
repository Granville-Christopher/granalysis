import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, FileText, Calendar, HardDrive } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const FileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    if (id) {
      fetchFile();
    }
  }, [id]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      // Get file from files list or create a detail endpoint
      const response = await api.get('/admin/files', {
        params: { limit: 1000 },
        withCredentials: true,
      });
      if (response.data) {
        const foundFile = response.data.files?.find((f: any) => f.id === parseInt(id || '0', 10));
        if (foundFile) {
          setFile(foundFile);
        }
      }
    } catch (error) {
      console.error('Failed to fetch file:', error);
      toast.error('Failed to load file details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await api.delete(`/admin/files/${id}`, { withCredentials: true });
      toast.success('File deleted successfully!');
      setShowDeleteModal(false);
      navigate('/admin/files');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    }
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!file) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>File not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/admin/files')}
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
          File Details
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div
          style={{
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            File Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                File Name
              </label>
              <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} />
                {file.originalName}
              </div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                MIME Type
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{file.mimeType}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Size
              </label>
              <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={16} />
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Status
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{file.status}</div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                Uploaded At
              </label>
              <div style={{ color: colors.text, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                {new Date(file.uploadedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <label style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                User ID
              </label>
              <div style={{ color: colors.text, fontSize: '14px' }}>{file.userId}</div>
            </div>
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
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => window.open(`/api/v1/files/${id}/download`, '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: colors.accent,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <Download size={18} />
              Download File
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <Trash2 size={18} />
              Delete File
            </button>
          </div>
        </div>
      </div>

      {/* Delete File Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={false}
      />
    </div>
  );
};

export default FileDetail;

