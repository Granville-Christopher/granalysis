import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  related?: string[];
}

interface ContextualHelpProps {
  helpId: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const helpDatabase: Record<string, HelpItem> = {
  'upload-file': {
    id: 'upload-file',
    title: 'Uploading Files',
    content: 'You can upload CSV, Excel, JSON, or SQL files. Files are automatically analyzed and insights are generated. Maximum file size is 10MB.',
    related: ['file-formats', 'file-limits'],
  },
  'file-formats': {
    id: 'file-formats',
    title: 'Supported File Formats',
    content: 'We support CSV (.csv), Excel (.xlsx, .xls), JSON (.json), and SQL (.sql) files. Make sure your files are properly formatted.',
  },
  'file-limits': {
    id: 'file-limits',
    title: 'File Limits',
    content: 'File limits depend on your subscription tier. Free tier: 1 file/month, 100 rows. Upgrade for more capacity.',
  },
  'insights-panel': {
    id: 'insights-panel',
    title: 'Understanding Insights',
    content: 'The insights panel shows key metrics, trends, and AI recommendations based on your data. Scroll through different sections to explore.',
  },
  'ai-assistant': {
    id: 'ai-assistant',
    title: 'AI Chat Assistant',
    content: 'Ask questions about your data, request charts, or get business advice. Available for Business and Enterprise tiers.',
  },
};

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ helpId, position = 'top' }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [isOpen, setIsOpen] = useState(false);

  const helpItem = helpDatabase[helpId];

  if (!helpItem) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Show help"
      >
        <HelpCircle className="w-4 h-4" style={{ color: colors.textSecondary }} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-50 ${positionClasses[position]} ${glassmorphismClass} rounded-lg shadow-2xl p-4 min-w-[250px] max-w-[300px]`}
            style={{
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className={`text-sm font-semibold ${colors.text}`}>{helpItem.title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10"
                aria-label="Close help"
              >
                <X className="w-3 h-3" style={{ color: colors.textSecondary }} />
              </button>
            </div>
            <p className={`text-xs ${colors.textSecondary} mb-2`}>{helpItem.content}</p>
            {helpItem.related && helpItem.related.length > 0 && (
              <div className="pt-2 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <p className={`text-xs font-medium mb-1 ${colors.text}`}>Related:</p>
                <div className="flex flex-wrap gap-1">
                  {helpItem.related.map((id) => (
                    <button
                      key={id}
                      className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      onClick={() => {
                        // Could navigate to related help
                        console.log('Related help:', id);
                      }}
                    >
                      {helpDatabase[id]?.title || id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

