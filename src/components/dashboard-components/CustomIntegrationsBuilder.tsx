import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Plus, Trash2, Edit, Check, X, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';
import { toast } from '../../utils/toast';

interface Integration {
  id: number;
  type: string;
  name: string;
  isActive: boolean;
  events: string[];
  createdAt: string;
}

interface CustomIntegrationsBuilderProps {
  onClose?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const CustomIntegrationsBuilder: React.FC<CustomIntegrationsBuilderProps> = ({ onClose, onModalStateChange }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Notify parent when modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(showCreateModal);
    }
  }, [showCreateModal, onModalStateChange]);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    type: 'webhook',
    name: '',
    url: '',
    events: [] as string[],
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      if (res.data?.status === 'success') {
        setIntegrations(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const credentials = formData.type === 'webhook' ? { url: formData.url } : {};
      await api.post('/integrations', {
        type: formData.type,
        name: formData.name,
        credentials,
        events: formData.events,
      });
      setShowCreateModal(false);
      setFormData({ type: 'webhook', name: '', url: '', events: [] });
      fetchIntegrations();
    } catch (error) {
      console.error('Failed to create integration:', error);
      toast.error('Failed to create integration');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.put(`/integrations/${id}/toggle`);
      fetchIntegrations();
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this integration?')) return;
    try {
      await api.delete(`/integrations/${id}`);
      fetchIntegrations();
    } catch (error) {
      console.error('Failed to delete integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const availableEvents = ['file.uploaded', 'file.processed', 'insights.generated', 'export.completed'];
  const integrationTypes = [
    { value: 'webhook', label: 'Webhook' },
    { value: 'slack', label: 'Slack' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'database', label: 'Database' },
  ];

  return (
    <div className={`${glassmorphismClass} rounded-lg p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-xl font-bold ${colors.text}`}>Custom Integrations</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchIntegrations}
            className={`p-2 rounded-lg transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" style={{ color: colors.accent }} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 font-medium"
            style={{
              backgroundColor: colors.accent,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Plus className="w-4 h-4" />
            New Integration
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <X className="w-4 h-4" style={{ color: colors.text }} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.accent }}></div>
          <p className={`mt-2 ${colors.textSecondary}`}>Loading integrations...</p>
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color: colors.accent }} />
          <p className={colors.textSecondary}>No integrations configured</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 rounded-lg text-white transition-colors font-medium"
            style={{
              backgroundColor: colors.accent,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Create Your First Integration
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`p-4 rounded-lg border transition-colors ${
                colors.isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${colors.text}`}>{integration.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      integration.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {integration.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400`}>
                      {integration.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm" style={{ color: colors.textSecondary }}>
                    {integration.events.map((event, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white/5">{event}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(integration.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      integration.isActive ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-gray-500/20 hover:bg-gray-500/30'
                    }`}
                    title={integration.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {integration.isActive ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal - Rendered via Portal at document root */}
      {showCreateModal && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setFormData({ type: 'webhook', name: '', url: '', events: [] });
            }
          }}
        >
          <div 
            className={`relative ${glassmorphismClass} rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto transform transition-all duration-300`} 
            style={{ 
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), ${colors.cardShadow}`,
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-bold ${colors.text}`}>Create Integration</h4>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ type: 'webhook', name: '', url: '', events: [] });
                }}
                className={`p-1 rounded transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" style={{ color: colors.text }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    colors.isDark 
                      ? 'bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-gray-200'
                  }`}
                  style={{
                    color: colors.text,
                  }}
                >
                  {integrationTypes.map((type) => (
                    <option 
                      key={type.value} 
                      value={type.value}
                      style={{
                        backgroundColor: colors.isDark ? '#0B1B3B' : '#FFFFFF',
                        color: colors.text,
                      }}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    colors.isDark 
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-200'
                  }`}
                  style={{
                    color: colors.text,
                  }}
                  placeholder="My Integration"
                />
              </div>
              {formData.type === 'webhook' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Webhook URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      colors.isDark 
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-200'
                    }`}
                    style={{
                      color: colors.text,
                    }}
                    placeholder="https://example.com/webhook"
                  />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Events</label>
                <div className="space-y-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
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
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{
                          accentColor: colors.accent,
                        }}
                      />
                      <span className={colors.textSecondary}>{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 rounded-lg text-white transition-colors font-medium"
                  style={{
                    backgroundColor: colors.accent,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ type: 'webhook', name: '', url: '', events: [] });
                  }}
                  className="px-4 py-2 rounded-lg border transition-colors font-medium"
                  style={{
                    borderColor: colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: colors.text,
                    backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

