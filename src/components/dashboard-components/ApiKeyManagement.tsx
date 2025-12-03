import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';

interface ApiKeyItem {
  id: number;
  name: string;
  keyPrefix: string;
  scopes: string[];
  requestCount: number;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export const ApiKeyManagement: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    scopes: ['files:read'] as string[],
    expiresIn: undefined as number | undefined,
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await api.get('/api-keys');
      if (res.data?.status === 'success') {
        setApiKeys(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api-keys', formData);
      if (res.data?.status === 'success') {
        setNewKey(res.data.data.key); // Show the key only once
        setShowCreate(false);
        setFormData({ name: '', scopes: ['files:read'], expiresIn: undefined });
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!window.confirm('Revoke this API key? It will stop working immediately.')) return;

    try {
      const res = await api.delete(`/api-keys/${id}`);
      if (res.data?.status === 'success') {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const handleCopy = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-lg font-semibold ${colors.text}`}>API Keys</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: colors.accent, color: 'white' }}
          aria-label="Create API key"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New Key Display (shown only once) */}
      {newKey && (
        <div className="mb-4 p-4 rounded-lg border-2" style={{ borderColor: colors.accent, backgroundColor: `${colors.accent}10` }}>
          <p className={`text-sm font-medium mb-2 ${colors.text}`}>⚠️ Save this key now - you won't be able to see it again!</p>
          <div className="flex items-center gap-2">
            <code className={`flex-1 px-3 py-2 rounded bg-black/20 text-sm font-mono ${colors.text}`}>
              {newKey}
            </code>
            <button
              onClick={() => handleCopy(newKey, -1)}
              className="p-2 rounded hover:bg-white/10"
              aria-label="Copy key"
            >
              {copied === -1 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" style={{ color: colors.text }} />
              )}
            </button>
            <button
              onClick={() => setNewKey(null)}
              className="p-2 rounded hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-4 p-4 rounded-lg space-y-3" style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My API Key"
              required
              className={`w-full px-3 py-2 rounded-lg border outline-none text-sm ${
                colors.isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Scopes</label>
            <div className="space-y-2">
              {['files:read', 'files:write', 'exports:read', 'exports:write'].map((scope) => (
                <label key={scope} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.scopes.includes(scope)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, scopes: [...formData.scopes, scope] });
                      } else {
                        setFormData({ ...formData, scopes: formData.scopes.filter((s) => s !== scope) });
                      }
                    }}
                    className="rounded"
                  />
                  <span className={`text-sm ${colors.text}`}>{scope}</span>
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
        {apiKeys.length === 0 ? (
          <p className={`text-sm text-center py-4 ${colors.textSecondary}`}>No API keys</p>
        ) : (
          apiKeys.map((key) => (
            <div
              key={key.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                colors.isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${colors.text}`}>{key.name}</p>
                  {!key.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">Revoked</span>
                  )}
                </div>
                <p className={`text-xs font-mono mt-1 ${colors.textSecondary}`}>{key.keyPrefix}</p>
                <div className="flex items-center gap-2 mt-1">
                  {key.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}
                    >
                      {scope}
                    </span>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                  Used {key.requestCount} times
                  {key.lastUsedAt && ` • Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(key.id)}
                className="p-1.5 rounded hover:bg-white/10"
                aria-label="Revoke API key"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

