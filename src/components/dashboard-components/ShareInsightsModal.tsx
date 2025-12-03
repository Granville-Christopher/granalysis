import React, { useState } from 'react';
import { X, Share2, Copy, Check, Calendar, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';

interface ShareInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
}

export const ShareInsightsModal: React.FC<ShareInsightsModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(7); // days
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const res = await api.post('/sharing/create-link', {
        fileId,
        expiresIn: expiresIn * 24 * 60 * 60 * 1000,
      });
      if (res.data?.status === 'success') {
        setShareLink(res.data.data.url);
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className={`${glassmorphismClass} rounded-2xl shadow-2xl max-w-md w-full`}
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className={`text-xl font-bold ${colors.text}`}>Share Insights</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 ${colors.textSecondary}`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className={`text-sm ${colors.textSecondary} mb-2`}>File: {fileName}</p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Link Expires In
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
                colors.isDark
                  ? 'border-white/20'
                  : 'border-gray-300'
              }`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                color: colors.isDark ? '#ffffff' : '#111827',
              }}
            >
              <option 
                value={1}
                style={{
                  backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                  color: colors.isDark ? '#ffffff' : '#111827',
                }}
              >
                1 day
              </option>
              <option 
                value={7}
                style={{
                  backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                  color: colors.isDark ? '#ffffff' : '#111827',
                }}
              >
                7 days
              </option>
              <option 
                value={30}
                style={{
                  backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                  color: colors.isDark ? '#ffffff' : '#111827',
                }}
              >
                30 days
              </option>
              <option 
                value={90}
                style={{
                  backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                  color: colors.isDark ? '#ffffff' : '#111827',
                }}
              >
                90 days
              </option>
            </select>
          </div>

          {shareLink ? (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${colors.text}`}>Share Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className={`flex-1 px-3 py-2 rounded-lg border outline-none ${
                    colors.isDark
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-lg transition-colors ${
                    copied ? 'bg-green-500' : colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5" style={{ color: colors.text }} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: colors.accent }}
            >
              {loading ? 'Creating...' : 'Create Share Link'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

