import React, { useState, useEffect } from 'react';
import { GitCompare, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';

interface DataComparisonProps {
  fileId1: number;
  fileId2: number;
}

export const DataComparison: React.FC<DataComparisonProps> = ({ fileId1, fileId2 }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, [fileId1, fileId2]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      // This would call a comparison endpoint
      // For now, we'll simulate it
      const [file1, file2] = await Promise.all([
        api.get(`/files/${fileId1}`),
        api.get(`/files/${fileId2}`),
      ]);

      // Compare insights
      const comparison = {
        file1: file1.data?.file,
        file2: file2.data?.file,
        differences: [
          { metric: 'Total Sales', file1: 10000, file2: 12000, change: 20, trend: 'up' },
          { metric: 'Total Orders', file1: 500, file2: 600, change: 20, trend: 'up' },
          { metric: 'Avg Order Value', file1: 20, file2: 20, change: 0, trend: 'neutral' },
        ],
      };

      setComparison(comparison);
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`${glassmorphismClass} rounded-xl p-6`}>Loading comparison...</div>;
  }

  if (!comparison) return null;

  return (
    <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center gap-2 mb-4">
        <GitCompare className="w-5 h-5" style={{ color: colors.accent }} />
        <h3 className={`text-lg font-semibold ${colors.text}`}>Data Comparison</h3>
      </div>

      <div className="space-y-4">
        {comparison.differences.map((diff: any, index: number) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${colors.text}`}>{diff.metric}</span>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${colors.textSecondary}`}>{diff.file1}</span>
                <span className={`text-sm ${colors.textSecondary}`}>→</span>
                <span className={`text-sm font-semibold ${colors.text}`}>{diff.file2}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {diff.trend === 'up' && (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{diff.change}%</span>
                </>
              )}
              {diff.trend === 'down' && (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">{diff.change}%</span>
                </>
              )}
              {diff.trend === 'neutral' && (
                <>
                  <Minus className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <span className={`text-sm ${colors.textSecondary}`}>No change</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

