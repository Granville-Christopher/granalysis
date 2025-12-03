import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  size = 'md',
  animated = true,
  color,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const progressColor = color || colors.accent;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className={`text-sm font-medium ${colors.text}`}>{label}</span>}
          {showPercentage && (
            <span className={`text-sm ${colors.textSecondary}`}>{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${heights[size]}`}
        style={{
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            animated ? 'ease-out' : ''
          }`}
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: progressColor,
            boxShadow: `0 0 10px ${progressColor}40`,
          }}
        />
      </div>
    </div>
  );
};

