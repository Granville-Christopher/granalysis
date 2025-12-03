import React, { useState, useEffect } from 'react';
import { History, Calendar, Search, User, Shield, Download, FileText } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const ActivityLogs: React.FC = () => {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [adminEmailFilter, setAdminEmailFilter] = useState('');
  const [ipAddressFilter, setIpAddressFilter] = useState('');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchLogs();
  }, [page, startDate, endDate, actionFilter, adminEmailFilter, ipAddressFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 50 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (actionFilter) params.action = actionFilter;
      if (adminEmailFilter) params.adminEmail = adminEmailFilter;
      if (ipAddressFilter) params.ipAddress = ipAddressFilter;

      const response = await api.get('/admin/activity-logs', {
        params,
        withCredentials: true,
      });
      if (response.data) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setExporting(true);
      const params: any = { format };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (actionFilter) params.action = actionFilter;
      if (adminEmailFilter) params.adminEmail = adminEmailFilter;
      if (ipAddressFilter) params.ipAddress = ipAddressFilter;

      const response = await api.get('/admin/activity-logs/export', {
        params,
        responseType: 'blob',
        withCredentials: true,
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Activity logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export activity logs:', error);
      toast.error('Failed to export activity logs');
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && logs.length === 0) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Activity Logs
      </h1>

      {/* Filters and Export */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textSecondary,
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: '8px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <input
          type="text"
          value={adminEmailFilter}
          onChange={(e) => setAdminEmailFilter(e.target.value)}
          placeholder="Filter by admin email..."
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            minWidth: '180px',
          }}
        />
        <input
          type="text"
          value={ipAddressFilter}
          onChange={(e) => setIpAddressFilter(e.target.value)}
          placeholder="Filter by IP address..."
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            minWidth: '180px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              background: exporting ? 'transparent' : colors.accent,
              color: exporting ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              background: exporting ? 'transparent' : colors.accent,
              color: exporting ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <FileText size={16} />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color={colors.textSecondary} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <span style={{ color: colors.textSecondary }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            color: colors.text,
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            All Actions
          </option>
          <option value="user_updated" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            User Updated
          </option>
          <option value="user_deleted" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            User Deleted
          </option>
          <option value="file_deleted" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            File Deleted
          </option>
          <option value="rate_limit_cache_cleared" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Rate Limit Cleared
          </option>
        </select>
      </div>

      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {filteredLogs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '16px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: `${colors.accent}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <History size={20} color={colors.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    Admin: {log.adminEmail} • IP: {log.ipAddress}
                  </div>
                  {log.metadata && (
                    <div style={{ color: colors.textSecondary, fontSize: '11px', marginTop: '4px' }}>
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No activity logs found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: page === 1 ? 'transparent' : colors.accent,
              color: page === 1 ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Previous
          </button>
          <span style={{ color: colors.text, fontSize: '14px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: page === totalPages ? 'transparent' : colors.accent,
              color: page === totalPages ? colors.textSecondary : 'white',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;

