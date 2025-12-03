import React, { useState, useEffect } from 'react';
import { Archive, Clock, Download, Trash2, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';
import { toast } from '../../utils/toast';

interface ArchivedFile {
  id: number;
  fileName: string;
  archivedAt: string;
  archivedBy: number;
  fileSize: number;
  rowCount: number;
  originalFileId: number;
}

interface DataArchivingPanelProps {
  onClose?: () => void;
  onFileRestored?: () => void;
}

export const DataArchivingPanel: React.FC<DataArchivingPanelProps> = ({ onClose, onFileRestored }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [archivedFiles, setArchivedFiles] = useState<ArchivedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedFiles();
  }, []);

  const fetchArchivedFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/archiving/files');
      if (res.data?.status === 'success') {
        setArchivedFiles(res.data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch archived files:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreFile = async (fileId: number) => {
    try {
      await api.post(`/archiving/files/${fileId}/restore`);
      toast.success('File restored successfully');
      fetchArchivedFiles();
      // Trigger sidebar refresh
      if (onFileRestored) {
        onFileRestored();
      }
    } catch (error: any) {
      console.error('Failed to restore file:', error);
      const errorMessage = error.response?.data?.message || 'Failed to restore file';
      toast.error(errorMessage);
    }
  };

  const deleteArchive = async (fileId: number) => {
    if (!window.confirm('Permanently delete this archived file?')) return;
    try {
      await api.delete(`/archiving/files/${fileId}`);
      toast.success('Archived file deleted successfully');
      fetchArchivedFiles();
    } catch (error: any) {
      console.error('Failed to delete archive:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete archive';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (dateString instanceof Date) {
      return dateString.toLocaleString();
    }
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`${glassmorphismClass} rounded-lg p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-xl font-bold ${colors.text}`}>Archived Files</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchArchivedFiles}
            className={`p-2 rounded-lg transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" style={{ color: colors.accent }} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <span className="material-icons text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.accent }}></div>
          <p className={`mt-2 ${colors.textSecondary}`}>Loading archived files...</p>
        </div>
      ) : archivedFiles.length === 0 ? (
        <div className="text-center py-8">
          <Archive className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color: colors.accent }} />
          <p className={colors.textSecondary}>No archived files</p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedFiles.map((file) => (
            <div
              key={file.id}
              className={`p-4 rounded-lg border transition-colors ${
                colors.isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${colors.text}`}>{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Archived {formatDate(file.archivedAt)}
                    </div>
                    <div>{formatFileSize(file.fileSize)}</div>
                    <div>{file.rowCount.toLocaleString()} rows</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restoreFile(file.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                    title="Restore file"
                  >
                    <RefreshCw className="w-4 h-4" style={{ color: colors.accent }} />
                  </button>
                  <button
                    onClick={() => deleteArchive(file.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                    title="Delete archive"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

