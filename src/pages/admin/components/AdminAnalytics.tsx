import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Calendar, Download } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';
import { toast } from '../../../utils/toast';

const AdminAnalytics: React.FC = () => {
  const [usageAnalytics, setUsageAnalytics] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const colors = THEME_CONFIG.dark;

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const [usageRes, userRes] = await Promise.all([
        api.get('/admin/analytics/usage', { params, withCredentials: true }),
        api.get('/admin/analytics/users', { params, withCredentials: true }),
      ]);

      if (usageRes.data) {
        setUsageAnalytics(usageRes.data);
      }
      if (userRes.data) {
        setUserAnalytics(userRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = (data: Record<string, number>, title: string) => {
    const maxValue = Math.max(...Object.values(data));
    const entries = Object.entries(data);

    return (
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map(([key, value]) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: colors.text, fontSize: '14px' }}>{key}</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>{value}</span>
              </div>
              <div
                style={{
                  height: '8px',
                  borderRadius: '4px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(value / maxValue) * 100}%`,
                    background: colors.accent,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold' }}>Analytics</h1>
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
            }}
            placeholder="End Date"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Usage Analytics */}
        {usageAnalytics && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <BarChart3 size={24} color={colors.accent} />
              <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600' }}>Usage Analytics</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>New Users</div>
                <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                  {usageAnalytics.metrics?.newUsers || 0}
                </div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>File Uploads</div>
                <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                  {usageAnalytics.metrics?.fileUploads || 0}
                </div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Security Events</div>
                <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                  {usageAnalytics.metrics?.securityEvents || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Analytics */}
        {userAnalytics && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Users size={24} color={colors.accent} />
              <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600' }}>User Analytics</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Total Users</div>
                <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                  {userAnalytics.total || 0}
                </div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Verified</div>
                <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                  {userAnalytics.verified || 0}
                </div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>Unverified</div>
                <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                  {userAnalytics.unverified || 0}
                </div>
              </div>
            </div>
            {userAnalytics.tierDistribution && renderBarChart(userAnalytics.tierDistribution, 'Tier Distribution')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;

