import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = true,
  circle = false,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  return (
    <div
      className={`animate-pulse ${rounded ? 'rounded' : ''} ${circle ? 'rounded-full' : ''} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
      aria-label="Loading..."
      role="status"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-xl space-y-4">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="80%" />
      <Skeleton height={16} width="40%" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height={40} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton height={24} width="40%" />
      <Skeleton height={300} />
      <div className="flex gap-2">
        <Skeleton height={16} width={60} />
        <Skeleton height={16} width={60} />
        <Skeleton height={16} width={60} />
      </div>
    </div>
  );
};

