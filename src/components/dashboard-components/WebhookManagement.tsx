import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, ToggleLeft, ToggleRight, TestTube } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';
import { toast } from '../../utils/toast';

interface WebhookItem {
  id: number;
  url: string;
  events: string[];
  isActive: boolean;
  successCount: number;
  failureCount: number;
  lastTriggeredAt?: string;
}

export const WebhookManagement: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: ['file.uploaded'] as string[],
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await api.get('/webhooks');
      if (res.data?.status === 'success') {
        setWebhooks(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/webhooks', formData);
      if (res.data?.status === 'success') {
        setShowCreate(false);
        setFormData({ url: '', events: ['file.uploaded'] });
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.put(`/webhooks/${id}/toggle`);
      if (res.data?.status === 'success') {
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this webhook?')) return;

    try {
      const res = await api.delete(`/webhooks/${id}`);
      if (res.data?.status === 'success') {
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const handleTest = async (id: number) => {
    try {
      const res = await api.post(`/webhooks/${id}/test`);
      if (res.data?.status === 'success') {
        toast.success('Test webhook sent successfully!');
        fetchWebhooks();
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
      toast.error('Test webhook failed');
    }
  };

  return (
    <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-lg font-semibold ${colors.text}`}>Webhooks</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: colors.accent, color: 'white' }}
          aria-label="Create webhook"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-4 p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Webhook URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://your-server.com/webhook"
              required
              className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
                colors.isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Events</label>
            <div className="space-y-2">
              {['file.uploaded', 'file.processed', 'export.completed', 'insights.generated'].map((event) => (
                <label key={event} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, events: [...formData.events, event] });
                      } else {
                        setFormData({ ...formData, events: formData.events.filter((e) => e !== event) });
                      }
                    }}
                    className="rounded"
                  />
                  <span className={`text-sm ${colors.text}`}>{event}</span>
                </label>
              ))}
            </div>
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
        {webhooks.length === 0 ? (
          <p className={`text-sm text-center py-4 ${colors.textSecondary}`}>No webhooks configured</p>
        ) : (
          webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                colors.isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${colors.text}`}>{webhook.url}</p>
                <div className="flex items-center gap-2 mt-1">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}
                    >
                      {event}
                    </span>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                  Success: {webhook.successCount} | Failures: {webhook.failureCount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTest(webhook.id)}
                  className="p-1.5 rounded hover:bg-white/10"
                  aria-label="Test webhook"
                  title="Test webhook"
                >
                  <TestTube className="w-4 h-4" style={{ color: colors.accent }} />
                </button>
                <button
                  onClick={() => handleToggle(webhook.id)}
                  className="p-1"
                  aria-label={webhook.isActive ? 'Disable' : 'Enable'}
                >
                  {webhook.isActive ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(webhook.id)}
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

