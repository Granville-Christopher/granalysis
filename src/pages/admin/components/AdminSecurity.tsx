import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Download, Calendar } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const AdminSecurity: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [threatLevelFilter, setThreatLevelFilter] = useState('');
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchEvents();
  }, [page, startDate, endDate, typeFilter, threatLevelFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 50 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (typeFilter) params.type = typeFilter;
      if (threatLevelFilter) params.threatLevel = threatLevelFilter;
      
      const response = await api.get('/admin/security/events', {
        params,
        withCredentials: true,
      });
      if (response.data) {
        setEvents(response.data.events || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (typeFilter) params.type = typeFilter;
      if (threatLevelFilter) params.threatLevel = threatLevelFilter;
      
      const response = await api.get('/admin/export/security-events', { params, withCredentials: true });
      const csv = convertToCSV(response.data.data);
      downloadCSV(csv, 'security-events.csv');
      toast.success('Security events exported successfully!');
    } catch (error) {
      console.error('Failed to export security events:', error);
      toast.error('Failed to export security events');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#eab308';
      default:
        return '#10b981';
    }
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>
          Security Events
        </h1>
        <button
          onClick={handleExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            background: colors.accent,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
            placeholder="Start Date"
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
            placeholder="End Date"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
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
        >
          <option value="" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            All Types
          </option>
          <option value="login_attempt" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Login Attempt
          </option>
          <option value="failed_login" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Failed Login
          </option>
          <option value="admin_action" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Admin Action
          </option>
          <option value="security_violation" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Security Violation
          </option>
        </select>
        <select
          value={threatLevelFilter}
          onChange={(e) => setThreatLevelFilter(e.target.value)}
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
        >
          <option value="" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            All Levels
          </option>
          <option value="critical" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Critical
          </option>
          <option value="high" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            High
          </option>
          <option value="medium" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Medium
          </option>
          <option value="low" style={{ background: colors.isDark ? '#1A345B' : '#ffffff', color: colors.text }}>
            Low
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
        {events.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '16px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  border: `1px solid ${getThreatColor(event.threatLevel)}40`,
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/admin/security/events/${event.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: `${getThreatColor(event.threatLevel)}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {event.threatLevel === 'critical' ? (
                        <AlertTriangle size={18} color={getThreatColor(event.threatLevel)} />
                      ) : (
                        <Shield size={18} color={getThreatColor(event.threatLevel)} />
                      )}
                    </div>
                    <div>
                      <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                        {event.eventType}
                      </div>
                      <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                        {event.description}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        background: `${getThreatColor(event.threatLevel)}20`,
                        color: getThreatColor(event.threatLevel),
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '4px',
                      }}
                    >
                      {event.threatLevel}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '11px' }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                {event.ipAddress && (
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '8px' }}>
                    IP: {event.ipAddress} | Endpoint: {event.endpoint}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>
            No security events found
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

export default AdminSecurity;

