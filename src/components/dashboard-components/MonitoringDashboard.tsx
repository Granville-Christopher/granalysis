import React, { useState, useEffect } from 'react';
import { Activity, Server, Zap, AlertTriangle, TrendingUp, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';
import { ProgressBar } from '../common/ProgressBar';
import DashboardLayout from './DashboardLayout';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const MonitoringDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUser = async () => {
    try {
      const storedUserData = sessionStorage.getItem('userData');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      } else {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const [metricsRes, usageRes, perfRes] = await Promise.all([
        api.get('/monitoring/metrics'),
        api.get('/monitoring/usage'),
        api.get('/monitoring/performance'),
      ]);

      if (metricsRes.data?.status === 'success') setMetrics(metricsRes.data.data);
      if (usageRes.data?.status === 'success') setUsage(usageRes.data.data);
      if (perfRes.data?.status === 'success') setPerformance(perfRes.data.data);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      sessionStorage.removeItem('userData');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      sessionStorage.removeItem('userData');
      navigate('/login');
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen  pt-10">
        <Header 
          onLogout={handleLogout} 
          user={user}
        />
        
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Page Header with Back Button */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${glassmorphismClass}`}
                style={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: colors.cardShadow,
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: colors.accent }} />
                <span className={`font-medium ${colors.text}`}>Back to Dashboard</span>
              </button>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${colors.text}`} style={{ color: colors.accent }}>
                  System Monitoring
                </h1>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>
                  Real-time system metrics and performance data
                </p>
              </div>
            </div>
            <button
              onClick={fetchMetrics}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${glassmorphismClass}`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: colors.cardShadow,
                border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: colors.accent }} />
              <span className={`font-medium ${colors.text}`}>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className={`${glassmorphismClass} rounded-xl p-8 text-center`} style={{ boxShadow: colors.cardShadow }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: colors.accent }}></div>
              <p className={`mt-4 ${colors.text}`}>Loading monitoring data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Metrics */}
              {metrics && (
                <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Server className="w-5 h-5" style={{ color: colors.accent }} />
                    <h3 className={`text-xl font-semibold ${colors.text}`}>System Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Server className="w-4 h-4" style={{ color: colors.accent }} />
                        <span className={`text-sm font-medium ${colors.textSecondary}`}>Memory Usage</span>
                      </div>
                      <ProgressBar
                        progress={(metrics.memory.heapUsed / metrics.memory.heapTotal) * 100}
                        showPercentage
                        size="sm"
                      />
                      <p className={`text-xs mt-2 ${colors.textSecondary}`}>
                        {formatBytes(metrics.memory.heapUsed)} / {formatBytes(metrics.memory.heapTotal)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4" style={{ color: colors.accent }} />
                        <span className={`text-sm font-medium ${colors.textSecondary}`}>CPU Usage</span>
                      </div>
                      <p className={`text-2xl font-bold ${colors.text}`}>
                        {metrics.cpu?.usage !== undefined && metrics.cpu?.usage !== null 
                          ? `${metrics.cpu.usage.toFixed(1)}%` 
                          : '0%'}
                      </p>
                      <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                        {metrics.cpu?.cores ? `${metrics.cpu.cores} cores` : 'CPU utilization'}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4" style={{ color: colors.accent }} />
                        <span className={`text-sm font-medium ${colors.textSecondary}`}>Uptime</span>
                      </div>
                      <p className={`text-2xl font-bold ${colors.text}`}>
                        {formatUptime(metrics.uptime)}
                      </p>
                      <p className={`text-xs mt-1 ${colors.textSecondary}`}>System uptime</p>
                    </div>
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4" style={{ color: colors.accent }} />
                        <span className={`text-sm font-medium ${colors.textSecondary}`}>Load Average</span>
                      </div>
                      <p className={`text-2xl font-bold ${colors.text}`}>
                        {metrics.loadAverage[0].toFixed(2)}
                      </p>
                      <p className={`text-xs mt-1 ${colors.textSecondary}`}>1 minute average</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {performance && (
                <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5" style={{ color: colors.accent }} />
                    <h3 className={`text-xl font-semibold ${colors.text}`}>Performance</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-xs font-medium ${colors.textSecondary} mb-2`}>Avg Response</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{performance.averageResponseTime}ms</p>
                    </div>
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-xs font-medium ${colors.textSecondary} mb-2`}>P95 Response</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{performance.p95ResponseTime}ms</p>
                    </div>
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-xs font-medium ${colors.textSecondary} mb-2`}>P99 Response</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{performance.p99ResponseTime}ms</p>
                    </div>
                    <div className={`p-4 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-xs font-medium ${colors.textSecondary} mb-2`}>Error Rate</p>
                      <p className={`text-2xl font-bold ${(performance.errorRate * 100) > 1 ? 'text-red-500' : colors.text}`}>
                        {(performance.errorRate * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg col-span-2`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-xs font-medium ${colors.textSecondary} mb-2`}>Requests per Minute</p>
                      <p className={`text-3xl font-bold ${colors.text}`}>{performance.requestsPerMinute}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Metrics */}
              {usage && (
                <div className={`${glassmorphismClass} rounded-xl p-6 lg:col-span-2`} style={{ boxShadow: colors.cardShadow }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5" style={{ color: colors.accent }} />
                    <h3 className={`text-xl font-semibold ${colors.text}`}>Your Usage</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-6 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-sm font-medium ${colors.textSecondary} mb-2`}>Total Events</p>
                      <p className={`text-3xl font-bold ${colors.text}`}>{usage.totalEvents.toLocaleString()}</p>
                      <p className={`text-xs mt-2 ${colors.textSecondary}`}>All-time event count</p>
                    </div>
                    <div className={`p-6 rounded-lg`} style={{ backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)' }}>
                      <p className={`text-sm font-medium ${colors.textSecondary} mb-2`}>Recent Events (30 days)</p>
                      <p className={`text-3xl font-bold ${colors.text}`}>{usage.recentEvents.toLocaleString()}</p>
                      <p className={`text-xs mt-2 ${colors.textSecondary}`}>Last 30 days activity</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonitoringDashboard;
