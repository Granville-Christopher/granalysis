import React, { useState, useEffect } from 'react';
import { Users, FileText, Shield, HardDrive, TrendingUp, AlertTriangle, Database } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG } from '../../../components/home/theme';

const AdminOverview: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colors = THEME_CONFIG.dark;

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/overview', { withCredentials: true });
        console.log('[AdminOverview] Full response:', response);
        console.log('[AdminOverview] Response data:', response.data);
        console.log('[AdminOverview] Response status:', response.status);
        
        // Check if response was intercepted and returned null
        if (response.data === null && response.status === 200) {
          console.error('[AdminOverview] Response was intercepted - likely 401 error was suppressed');
          // Try to get the actual error from the response
          const errorMessage = 'Authentication failed. Please log in again.';
          console.error('[AdminOverview] Error:', errorMessage);
          setOverview({ stats: {}, recentUsers: [] });
          // Optionally redirect to login
          // window.location.href = '/admin/login';
          return;
        }
        
        // Handle both direct data and wrapped responses
        const data = response.data?.stats ? response.data : (response.data || {});
        
        if (data.stats || data.totalUsers !== undefined) {
          console.log('[AdminOverview] Stats:', data.stats || data);
          console.log('[AdminOverview] Total rows analyzed:', data.stats?.totalRowsAnalyzed || data.totalRowsAnalyzed);
          setOverview(data);
        } else {
          console.warn('[AdminOverview] No stats found in response:', data);
          setOverview({ stats: {}, recentUsers: [] });
        }
      } catch (error: any) {
        console.error('Failed to fetch overview:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // If 401, redirect to login
        if (error.response?.status === 401) {
          console.log('[AdminOverview] 401 Unauthorized - redirecting to login');
          window.location.href = '/admin/login';
          return;
        }
        
        setOverview({ stats: {}, recentUsers: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const stats = overview?.stats || {};
  const recentUsers = overview?.recentUsers || [];

  // Debug logging
  console.log('[AdminOverview] Current stats:', stats);
  console.log('[AdminOverview] totalRowsAnalyzed value:', stats.totalRowsAnalyzed, 'type:', typeof stats.totalRowsAnalyzed);

  const statCards = [
    {
      icon: Database,
      label: 'Total Rows Analyzed',
      value: stats.totalRowsAnalyzed !== undefined && stats.totalRowsAnalyzed !== null 
        ? Number(stats.totalRowsAnalyzed).toLocaleString() 
        : '0',
      color: '#4FA3FF',
      description: 'Across all files',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers || 0,
      color: '#3b82f6',
    },
    {
      icon: TrendingUp,
      label: 'Active Users (24h)',
      value: stats.activeUsers || 0,
      color: '#10b981',
    },
    {
      icon: FileText,
      label: 'Total Files',
      value: stats.totalFiles || 0,
      color: '#8b5cf6',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: `${stats.storageUsedGB || '0'} GB`,
      color: '#f59e0b',
    },
    {
      icon: Shield,
      label: 'Critical Security Events',
      value: stats.criticalSecurityEvents || 0,
      color: '#ef4444',
    },
  ];

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              style={{
                background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={stat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>
                    {stat.value}
                  </div>
                  {stat.description && (
                    <div style={{ color: colors.textSecondary, fontSize: '11px', marginTop: '2px' }}>
                      {stat.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Users */}
      <div
        style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Recent Users
        </h2>
        {recentUsers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentUsers.map((user: any) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                    {user.fullName || user.email}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{user.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      background: `${colors.accent}20`,
                      color: colors.accent,
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    {user.tier || 'free'}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '11px', marginTop: '4px' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '20px' }}>
            No recent users
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;

