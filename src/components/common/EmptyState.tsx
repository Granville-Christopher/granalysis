import React from 'react';
import { FileText, Upload, Search, AlertCircle, Inbox } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';

export type EmptyStateType = 'no-files' | 'no-results' | 'error' | 'no-data' | 'default';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const defaultConfigs: Record<EmptyStateType, { icon: React.ReactNode; title: string; message: string }> = {
  'no-files': {
    icon: <FileText className="w-16 h-16" />,
    title: 'No Files Yet',
    message: 'Upload your first data file to get started with analytics and insights.',
  },
  'no-results': {
    icon: <Search className="w-16 h-16" />,
    title: 'No Results Found',
    message: 'Try adjusting your filters or search terms to find what you\'re looking for.',
  },
  error: {
    icon: <AlertCircle className="w-16 h-16" />,
    title: 'Something Went Wrong',
    message: 'We encountered an error. Please try again or contact support if the problem persists.',
  },
  'no-data': {
    icon: <Inbox className="w-16 h-16" />,
    title: 'No Data Available',
    message: 'There\'s no data to display. Upload a file or check back later.',
  },
  default: {
    icon: <FileText className="w-16 h-16" />,
    title: 'Empty State',
    message: 'Nothing to show here.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  message,
  action,
  icon,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const config = defaultConfigs[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className="mb-4 opacity-50"
        style={{ color: colors.textSecondary }}
      >
        {icon || config.icon}
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>
        {title || config.title}
      </h3>
      <p className={`text-sm mb-6 max-w-md ${colors.textSecondary}`}>
        {message || config.message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg font-semibold text-white transition-all"
          style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, #2563eb 100%)`,
            boxShadow: `0 4px 15px ${colors.accent}40`,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

