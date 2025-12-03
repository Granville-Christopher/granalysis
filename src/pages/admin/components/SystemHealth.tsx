import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, TrendingUp } from 'lucide-react';
import api from '../../../utils/axios';
import { THEME_CONFIG, ThemeConfig } from '../../../components/home/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { toast } from '../../../utils/toast';

const SystemHealth: React.FC = () => {
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/monitoring/metrics', { withCredentials: true });
      if (response.data?.status === 'success') {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      toast.error('Failed to load system metrics');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return '#10b981'; // Good
    if (value < threshold * 0.9) return '#eab308'; // Warning
    return '#ef4444'; // Critical
  };

  if (loading && !metrics) {
    return <div style={{ color: colors.text, textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        System Health
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {metrics?.memory && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <HardDrive size={24} color={colors.accent} />
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>CPU Memory</h3>
            </div>
            <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              {metrics.memory.used ? (metrics.memory.used / 1024 / 1024 / 1024).toFixed(2) : '0'} GB
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
              of {metrics.memory.total ? (metrics.memory.total / 1024 / 1024 / 1024).toFixed(2) : '0'} GB
            </div>
            {metrics.memory.used && metrics.memory.total && (
              <>
                <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '12px', opacity: 0.7 }}>
                  {((metrics.memory.used / 1024 / 1024).toFixed(0))} MB / {((metrics.memory.total / 1024 / 1024).toFixed(0))} MB
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
                      width: `${(metrics.memory.used / metrics.memory.total) * 100}%`,
                      background: getHealthColor(metrics.memory.used / metrics.memory.total, 1),
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {metrics?.cpu && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Cpu size={24} color={colors.accent} />
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>CPU Usage</h3>
            </div>
            <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {metrics.cpu.usage !== undefined && metrics.cpu.usage !== null ? metrics.cpu.usage.toFixed(1) : '0'}%
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '12px' }}>Usage</div>
            {metrics.cpu.usage !== undefined && metrics.cpu.usage !== null && (
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
                    width: `${Math.min(100, Math.max(0, metrics.cpu.usage))}%`,
                    background: getHealthColor(metrics.cpu.usage, 100),
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {metrics?.gpu && metrics.gpu.available && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <HardDrive size={24} color={colors.accent} />
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>GPU Memory</h3>
            </div>
            <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              {metrics.gpu.memoryUsed ? (metrics.gpu.memoryUsed / 1024 / 1024 / 1024).toFixed(2) : '0'} GB
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
              of {metrics.gpu.memoryTotal ? (metrics.gpu.memoryTotal / 1024 / 1024 / 1024).toFixed(2) : '0'} GB
            </div>
            {metrics.gpu.memoryUsed && metrics.gpu.memoryTotal && (
              <>
                <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '12px', opacity: 0.7 }}>
                  {((metrics.gpu.memoryUsed / 1024 / 1024).toFixed(0))} MB / {((metrics.gpu.memoryTotal / 1024 / 1024).toFixed(0))} MB
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
                      width: `${(metrics.gpu.memoryUsed / metrics.gpu.memoryTotal) * 100}%`,
                      background: getHealthColor(metrics.gpu.memoryUsed / metrics.gpu.memoryTotal, 1),
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {metrics?.gpu && metrics.gpu.available && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Cpu size={24} color={colors.accent} />
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>GPU Usage</h3>
            </div>
            <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {metrics.gpu.usage !== undefined && metrics.gpu.usage !== null ? metrics.gpu.usage.toFixed(1) : '0'}%
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '12px' }}>Usage</div>
            {metrics.gpu.usage !== undefined && metrics.gpu.usage !== null && (
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
                    width: `${Math.min(100, Math.max(0, metrics.gpu.usage))}%`,
                    background: getHealthColor(metrics.gpu.usage, 100),
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {metrics?.uptime !== undefined && metrics?.uptime !== null && (
          <div
            style={{
              background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Server size={24} color={colors.accent} />
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>Uptime</h3>
            </div>
            <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              {Math.floor(metrics.uptime / 3600)}h
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
              Server uptime
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '11px', opacity: 0.7 }}>
              {Math.floor((metrics.uptime % 3600) / 60)}m
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;

