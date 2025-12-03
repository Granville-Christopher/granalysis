import React, { useState, useEffect } from 'react';
import { FileText, X, Download, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import { Skeleton, TableSkeleton } from '../common/LoadingSkeleton';
import api from '../../utils/axios';

interface FilePreviewProps {
  fileId: number;
  fileName: string;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileId, fileName, onClose }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/files/${fileId}`);
        // Fetch actual data preview from Python service
        const pythonRes = await fetch(`http://localhost:8000/data/${fileId}`);
        if (pythonRes.ok) {
          const data = await pythonRes.json();
          setPreviewData(data.preview || []);
        } else {
          throw new Error('Failed to fetch preview data');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [fileId]);

  const handleDownload = async () => {
    try {
      const res = await fetch(`/files/${fileId}/download`, { credentials: 'include' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className={`${glassmorphismClass} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" style={{ color: colors.accent }} />
            <div>
              <h2 className={`text-xl font-bold ${colors.text}`}>{fileName}</h2>
              <p className={`text-sm ${colors.textSecondary}`}>File Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${colors.textSecondary}`}
              aria-label="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${colors.textSecondary}`}
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : error ? (
            <div className="text-center py-12">
              <p className={`text-red-500 mb-4`}>{error}</p>
            </div>
          ) : previewData.length === 0 ? (
            <div className="text-center py-12">
              <p className={colors.textSecondary}>No preview data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th
                        key={key}
                        className={`px-4 py-2 text-left border-b font-semibold ${colors.text}`}
                        style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 20).map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? (colors.isDark ? 'bg-white/5' : 'bg-gray-50') : ''}
                    >
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-4 py-2 border-b ${colors.text}`}
                          style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                        >
                          {String(value || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 20 && (
                <p className={`text-sm text-center mt-4 ${colors.textSecondary}`}>
                  Showing first 20 rows of {previewData.length} total rows
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

