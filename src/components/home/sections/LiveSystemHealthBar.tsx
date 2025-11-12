import React, { useState, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { healthMetrics } from '../data';

export const LiveSystemHealthBar = ({ colors }: { colors: ThemeConfig }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [liveValues, setLiveValues] = useState<{ [key: string]: string }>({});
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  // Initialize live values from healthMetrics
  useEffect(() => {
    const initialValues: { [key: string]: string } = {};
    healthMetrics.forEach(metric => {
      initialValues[metric.label] = metric.value;
    });
    setLiveValues(initialValues);
  }, []);

  // Update values periodically to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveValues(prev => {
        const updated = { ...prev };
        healthMetrics.forEach(metric => {
          if (metric.label === 'API Latency') {
            // Vary between 30-40ms
            const base = 35;
            const variation = (Math.random() - 0.5) * 10;
            const newValue = Math.round(base + variation);
            updated[metric.label] = `${newValue}ms`;
          } else if (metric.label === 'Uptime') {
            // Vary between 99.97-99.99%
            const base = 99.98;
            const variation = (Math.random() - 0.5) * 0.02;
            const newValue = base + variation;
            updated[metric.label] = `${newValue.toFixed(2)}%`;
          } else if (metric.label === 'AI Response') {
            // Vary between 1.0-1.4s
            const base = 1.2;
            const variation = (Math.random() - 0.5) * 0.4;
            const newValue = base + variation;
            updated[metric.label] = `${newValue.toFixed(1)}s`;
          }
        });
        return updated;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 transition-all duration-300 ${isExpanded ? 'h-32' : 'h-12'} ${glassmorphismClass}`}
      style={{
        borderRadius: '0',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        boxShadow: colors.isDark ? '0 -2px 10px rgba(0, 0, 0, 0.5)' : '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto p-2">
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4`} style={{ color: accentColor }} />
            <span className={`font-semibold tracking-wider uppercase ${colors.text} hidden sm:inline`}>System Health</span>
            <span className={`font-semibold ${colors.text} sm:hidden`}>Health</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-4 sm:space-x-6">
              {healthMetrics.map(metric => (
                <div key={metric.label} className="flex items-center space-x-1">
                  <span className={`hidden md:inline ${colors.textSecondary}`}>{metric.label}:</span>
                  <span className={`font-mono font-bold transition-all duration-500 ${metric.color}`}>
                    {liveValues[metric.label] || metric.value}
                  </span>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: metric.color.includes('green') ? 'rgb(74, 222, 128)' : 'rgb(251, 191, 36)' }}></div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className={`w-4 h-4 ${colors.text}`} />
                ) : (
                  <ChevronUp className={`w-4 h-4 ${colors.text}`} />
                )}
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className={`p-1 rounded transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                aria-label="Dismiss"
              >
                <X className={`w-4 h-4 ${colors.textSecondary}`} />
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t ${colors.isDark ? 'border-white/10' : 'border-gray-300'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {healthMetrics.map(metric => (
                <div key={metric.label} className={`p-2 rounded ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${colors.textSecondary}`}>{metric.label}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color.includes('green') ? 'rgb(74, 222, 128)' : 'rgb(251, 191, 36)' }}></div>
                  </div>
                  <div className={`font-mono font-bold text-lg transition-all duration-500 ${metric.color}`}>
                    {liveValues[metric.label] || metric.value}
                  </div>
                  <div className={`text-xs ${colors.textSecondary} mt-1`}>All systems operational</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


