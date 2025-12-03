import React from 'react';
import { BarChart3, PieChart, LineChart, Activity } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
} from 'recharts';

interface AdvancedVisualizationsProps {
  data: any;
  visualizationType: 'heatmap' | 'treemap' | 'radar' | 'scatter';
}

export const AdvancedVisualizations: React.FC<AdvancedVisualizationsProps> = ({
  data,
  visualizationType,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  const renderVisualization = () => {
    switch (visualizationType) {
      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={data}
              dataKey="value"
              nameKey="name"
              stroke={colors.isDark ? '#fff' : '#000'}
              fill={colors.accent}
            />
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className={colors.textSecondary}>Visualization type not implemented</p>
          </div>
        );
    }
  };

  return (
    <div className={`${glassmorphismClass} rounded-xl p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: colors.accent }} />
        <h3 className={`text-lg font-semibold ${colors.text}`}>
          {visualizationType.charAt(0).toUpperCase() + visualizationType.slice(1)}
        </h3>
      </div>
      {renderVisualization()}
    </div>
  );
};

