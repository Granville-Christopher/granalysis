import React, { useState, useEffect } from 'react';
import { History, Clock, User, Download, RefreshCw, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';
import { toast } from '../../utils/toast';

interface FileVersion {
  id: number;
  version: number;
  createdAt: string;
  createdBy: number;
  fileSize: number;
  rowCount: number;
  changes?: string;
}

interface DataVersioningPanelProps {
  fileId: number;
  onClose?: () => void;
}

export const DataVersioningPanel: React.FC<DataVersioningPanelProps> = ({ fileId, onClose }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [fileId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/data-versioning/files/${fileId}/versions`);
      if (res.data?.status === 'success') {
        setVersions(res.data.versions || []);
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (versionId: number) => {
    try {
      await api.post(`/data-versioning/versions/${versionId}/restore`);
      toast.success('Version restored successfully');
      fetchVersions();
    } catch (error: any) {
      console.error('Failed to restore version:', error);
      const errorMessage = error.response?.data?.message || 'Failed to restore version';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
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
          <History className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-xl font-bold ${colors.text}`}>Data Version History</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchVersions}
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
          <p className={`mt-2 ${colors.textSecondary}`}>Loading versions...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color: colors.accent }} />
          <p className={colors.textSecondary}>No version history available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-4 rounded-lg border transition-colors ${
                selectedVersion === version.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : colors.isDark
                  ? 'border-white/10 hover:border-white/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVersion(version.id === selectedVersion ? null : version.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${colors.text}`}>Version {version.version}</span>
                    {version.version === versions[0]?.version && (
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">Current</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {formatFileSize(version.fileSize)}
                    </div>
                    <div>{version.rowCount.toLocaleString()} rows</div>
                  </div>
                  {version.changes && (
                    <p className={`mt-2 text-sm ${colors.textSecondary}`}>{version.changes}</p>
                  )}
                </div>
                {version.version !== versions[0]?.version && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Restore this version? This will replace the current file.')) {
                        restoreVersion(version.id);
                      }
                    }}
                    className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                    title="Restore this version"
                  >
                    <RefreshCw className="w-4 h-4" style={{ color: colors.accent }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

