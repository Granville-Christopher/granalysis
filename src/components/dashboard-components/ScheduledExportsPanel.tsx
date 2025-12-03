import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ToggleLeft, ToggleRight, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';

interface ScheduledExport {
  id: number;
  fileId: number;
  format: string;
  frequency: string;
  email?: string;
  isActive: boolean;
  nextRunAt: string;
  lastRunAt?: string;
}

interface ScheduledExportsPanelProps {
  fileId?: number;
}

export const ScheduledExportsPanel: React.FC<ScheduledExportsPanelProps> = ({ fileId }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    fileId: fileId || 0,
    format: 'csv',
    frequency: 'weekly',
    email: '',
  });

  useEffect(() => {
    fetchScheduledExports();
  }, [fileId]);

  const fetchScheduledExports = async () => {
    try {
      const res = await api.get('/scheduled-exports');
      if (res.data?.status === 'success') {
        const filtered = fileId
          ? res.data.data.filter((e: ScheduledExport) => e.fileId === fileId)
          : res.data.data;
        setExports(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled exports:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/scheduled-exports', formData);
      if (res.data?.status === 'success') {
        setShowCreate(false);
        setFormData({ fileId: fileId || 0, format: 'csv', frequency: 'weekly', email: '' });
        fetchScheduledExports();
      }
    } catch (error) {
      console.error('Failed to create scheduled export:', error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.put(`/scheduled-exports/${id}/toggle`);
      if (res.data?.status === 'success') {
        fetchScheduledExports();
      }
    } catch (error) {
      console.error('Failed to toggle scheduled export:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this scheduled export?')) return;

    try {
      const res = await api.delete(`/scheduled-exports/${id}`);
      if (res.data?.status === 'success') {
        fetchScheduledExports();
      }
    } catch (error) {
      console.error('Failed to delete scheduled export:', error);
    }
  };

  return (
    <div className={`${glassmorphismClass} rounded-xl p-4`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-lg font-semibold ${colors.text}`}>Scheduled Exports</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: colors.accent, color: 'white' }}
          aria-label="Create scheduled export"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-4 p-3 rounded-lg space-y-3" style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
                colors.isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
                colors.isDark
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>
              <Mail className="w-4 h-4 inline mr-1" />
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
                colors.isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: colors.accent }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className={`px-4 py-2 rounded-lg font-medium ${colors.textSecondary}`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {exports.length === 0 ? (
          <p className={`text-sm text-center py-4 ${colors.textSecondary}`}>No scheduled exports</p>
        ) : (
          exports.map((exportItem) => (
            <div
              key={exportItem.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                colors.isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {exportItem.format.toUpperCase()}
                  </span>
                  <span className={`text-xs ${colors.textSecondary}`}>
                    {exportItem.frequency}
                  </span>
                  {exportItem.email && (
                    <span className={`text-xs ${colors.textSecondary}`}>
                      <Mail className="w-3 h-3 inline" /> {exportItem.email}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                  Next: {new Date(exportItem.nextRunAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(exportItem.id)}
                  className="p-1"
                  aria-label={exportItem.isActive ? 'Disable' : 'Enable'}
                >
                  {exportItem.isActive ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(exportItem.id)}
                  className="p-1 rounded hover:bg-white/10"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

