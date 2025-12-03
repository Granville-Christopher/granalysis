import React, { useState, useEffect } from 'react';
import { X, Database, Loader2, FileText } from 'lucide-react';
import api from '../../utils/axios';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';
import { toast } from '../../utils/toast';

interface BackupContent {
  type: string;
  schema: string;
  name: string;
  owner: string;
  description: string;
}

interface BackupContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
}

const BackupContentsModal: React.FC<BackupContentsModalProps> = ({
  isOpen,
  onClose,
  filename,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  
  const [contents, setContents] = useState<BackupContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && filename) {
      fetchContents();
    } else {
      setContents([]);
      setFilter('all');
      setSearchTerm('');
    }
  }, [isOpen, filename]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/backup/${filename}/contents`, { withCredentials: true });
      if (response.data?.status === 'success') {
        setContents(response.data.contents || []);
      } else {
        toast.error(response.data?.message || 'Failed to load backup contents');
      }
    } catch (error: any) {
      console.error('Failed to fetch backup contents:', error);
      toast.error(error.response?.data?.message || 'Failed to load backup contents');
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(item => {
    const matchesFilter = filter === 'all' || item.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.schema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const typeCounts = contents.reduce((acc, item) => {
    const type = item.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueTypes = Array.from(new Set(contents.map(item => item.type.toLowerCase()))).sort();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.isDark ? '#1a1a2e' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={24} color={colors.accent} />
            <div>
              <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                Backup Contents
              </h2>
              <p style={{ color: colors.textSecondary, fontSize: '14px', margin: '4px 0 0 0' }}>
                {filename}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search tables, schemas, types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: colors.text,
                fontSize: '14px',
              }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              color: colors.text,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: colors.isDark ? '#1a1a2e' : '#ffffff', color: colors.text }}>
              All Types ({contents.length})
            </option>
            {uniqueTypes.map(type => (
              <option key={type} value={type} style={{ background: colors.isDark ? '#1a1a2e' : '#ffffff', color: colors.text }}>
                {type.toUpperCase()} ({typeCounts[type] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`, borderRadius: '8px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '12px' }}>
              <Loader2 size={20} color={colors.accent} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: colors.textSecondary }}>Loading backup contents...</span>
            </div>
          ) : filteredContents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No contents found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderBottom: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: '13px', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: '13px', fontWeight: '600' }}>Schema</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: '13px', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.text, fontSize: '13px', fontWeight: '600' }}>Owner</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.map((item, index) => (
                  <tr
                    key={`${item.type}-${item.schema}-${item.name}-${index}`}
                    style={{
                      borderBottom: index < filteredContents.length - 1 ? `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}` : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: colors.text, fontSize: '13px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(79, 163, 255, 0.1)',
                          color: colors.accent,
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textSecondary, fontSize: '13px' }}>
                      {item.schema}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textSecondary, fontSize: '13px' }}>
                      {item.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
          <div style={{ color: colors.textSecondary, fontSize: '13px' }}>
            Showing {filteredContents.length} of {contents.length} items
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: colors.accent,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        select option {
          background: ${colors.isDark ? '#1a1a2e' : '#ffffff'};
          color: ${colors.text};
        }
      `}</style>
    </div>
  );
};

export default BackupContentsModal;

