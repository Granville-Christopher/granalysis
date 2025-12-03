import React, { useState, useEffect } from 'react';
import { Database, X, Plus, Trash2, ToggleLeft, ToggleRight, TestTube, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/axios';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, getGlassmorphismClass } from '../home/theme';

interface DatabaseConnection {
  id: number;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  isActive: boolean;
  lastSync?: Date;
  syncStatus?: 'success' | 'error' | 'pending';
}

export const DatabaseLinkingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql' as 'postgresql' | 'mysql' | 'mongodb' | 'sqlite',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
      
      // Real-time sync: Poll for sync status every 5 seconds for active connections
      const syncInterval = setInterval(() => {
        const activeConnections = connections.filter(c => c.isActive);
        if (activeConnections.length > 0) {
          fetchConnections();
        }
      }, 5000);
      
      return () => clearInterval(syncInterval);
    }
  }, [isOpen, connections.length]);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/integrations');
      if (res.data?.status === 'success') {
        const dbIntegrations = res.data.data.filter((i: any) => i.type === 'database');
        setConnections(dbIntegrations.map((i: any) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          host: i.host || 'N/A',
          port: i.port || 5432,
          database: i.database || 'N/A',
          username: i.username || 'N/A',
          isActive: i.isActive,
          lastSync: i.lastSync ? new Date(i.lastSync) : undefined,
          syncStatus: i.syncStatus,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch database connections:', error);
    }
  };

  const handleTestConnection = async (id: number) => {
    setTesting(id);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/integrations/${id}/test`);
      if (res.data?.status === 'success') {
        setSuccess('Connection test successful!');
        setTimeout(() => setSuccess(''), 3000);
        fetchConnections();
      } else {
        setError(res.data?.message || 'Connection test failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection test failed');
    } finally {
      setTesting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/integrations', {
        type: 'database',
        name: formData.name,
        credentials: {
          type: formData.type,
          host: formData.host,
          port: formData.port,
          database: formData.database,
          username: formData.username,
          password: formData.password,
        },
        events: ['file_upload', 'data_update'],
      });

      if (res.data?.status === 'success') {
        setSuccess('Database connection created successfully!');
        setFormData({
          name: '',
          type: 'postgresql',
          host: '',
          port: 5432,
          database: '',
          username: '',
          password: '',
        });
        setShowForm(false);
        setTimeout(() => {
          setSuccess('');
          fetchConnections();
        }, 2000);
      } else {
        setError(res.data?.message || 'Failed to create connection');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create connection');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.put(`/integrations/${id}/toggle`);
      if (res.data?.status === 'success') {
        fetchConnections();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle connection');
    }
  };

  const handleSync = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/integrations/${id}/sync`);
      if (res.data?.status === 'success') {
        setSuccess('Sync started successfully!');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh connections after a short delay to see sync status
        setTimeout(() => fetchConnections(), 2000);
      } else {
        setError(res.data?.message || 'Failed to start sync');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start sync');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this database connection?')) return;
    try {
      const res = await api.delete(`/integrations/${id}`);
      if (res.data?.status === 'success') {
        fetchConnections();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete connection');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`${glassmorphismClass} rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl ${colors.glassBorder} border`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className={`w-6 h-6 ${colors.accent}`} />
            <h3 className={`text-2xl font-semibold ${colors.text}`}>Database Linking</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${colors.text}`} />
          </button>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2`}>
            <XCircle className="w-4 h-4 text-red-500" />
            <p className={`text-sm ${colors.text}`}>{error}</p>
          </div>
        )}

        {success && (
          <div className={`mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2`}>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className={`text-sm ${colors.text}`}>{success}</p>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showForm
                ? 'bg-gray-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Add Database Connection'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={`mb-6 p-4 rounded-lg border ${colors.glassBorder}`}>
            <h4 className={`text-lg font-semibold mb-4 ${colors.text}`}>New Database Connection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Connection Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                  placeholder="My Database"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Database Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                >
                  <option 
                    value="postgresql"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                      color: colors.isDark ? '#ffffff' : '#111827',
                    }}
                  >
                    PostgreSQL
                  </option>
                  <option 
                    value="mysql"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                      color: colors.isDark ? '#ffffff' : '#111827',
                    }}
                  >
                    MySQL
                  </option>
                  <option 
                    value="mongodb"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                      color: colors.isDark ? '#ffffff' : '#111827',
                    }}
                  >
                    MongoDB
                  </option>
                  <option 
                    value="sqlite"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#ffffff',
                      color: colors.isDark ? '#ffffff' : '#111827',
                    }}
                  >
                    SQLite
                  </option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Host</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                  placeholder="localhost"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Port</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Database Name</label>
                <input
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${colors.text}`}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${colors.glassBorder} outline-none transition-colors`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                    color: colors.isDark ? '#ffffff' : '#111827',
                  }}
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Connection'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {connections.length === 0 ? (
            <p className={`text-center py-8 ${colors.textSecondary}`}>No database connections</p>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                className={`p-4 rounded-lg border ${colors.glassBorder} ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className={`font-semibold ${colors.text}`}>{conn.name}</h4>
                    <p className={`text-sm ${colors.textSecondary}`}>
                      {conn.type.toUpperCase()} - {conn.host}:{conn.port}/{conn.database}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(conn.id)}
                      disabled={testing === conn.id}
                      className="p-2 rounded-lg transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }}
                      title="Test connection"
                    >
                      <TestTube className={`w-4 h-4 ${colors.text}`} />
                    </button>
                    {conn.isActive && (
                      <button
                        onClick={() => handleSync(conn.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        }}
                        title="Sync now"
                      >
                        <RefreshCw className={`w-4 h-4 ${colors.text}`} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggle(conn.id)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }}
                      title={conn.isActive ? 'Disable' : 'Enable'}
                    >
                      {conn.isActive ? (
                        <ToggleRight className={`w-4 h-4 text-green-500`} />
                      ) : (
                        <ToggleLeft className={`w-4 h-4 ${colors.textSecondary}`} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(conn.id)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }}
                      title="Delete connection"
                    >
                      <Trash2 className={`w-4 h-4 text-red-500`} />
                    </button>
                  </div>
                </div>
                {conn.lastSync && (
                  <p className={`text-xs ${colors.textSecondary}`}>
                    Last sync: {conn.lastSync.toLocaleString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

