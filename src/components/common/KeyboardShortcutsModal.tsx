import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import { COMMON_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: Array<{ key: string; description: string; keys: string[] }>;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = [],
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  const defaultShortcuts = [
    { key: 'Ctrl+K', description: 'Search', keys: ['Ctrl', 'K'] },
    { key: 'Ctrl+U', description: 'Upload file', keys: ['Ctrl', 'U'] },
    { key: 'Ctrl+N', description: 'New chat', keys: ['Ctrl', 'N'] },
    { key: 'Esc', description: 'Close modal', keys: ['Esc'] },
    { key: 'Ctrl+S', description: 'Save', keys: ['Ctrl', 'S'] },
    { key: 'Ctrl+Shift+E', description: 'Export data', keys: ['Ctrl', 'Shift', 'E'] },
    { key: 'Ctrl+R', description: 'Refresh', keys: ['Ctrl', 'R'] },
    { key: '?', description: 'Show help', keys: ['?'] },
    { key: 'Ctrl+Shift+D', description: 'Toggle dark mode', keys: ['Ctrl', 'Shift', 'D'] },
  ];

  const displayShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className={`${glassmorphismClass} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto`}
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className={`text-2xl font-bold ${colors.text}`}>Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${colors.textSecondary}`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-4">
          {displayShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 rounded-lg"
              style={{
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <span className={`text-sm ${colors.text}`}>{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd
                      className="px-2 py-1 text-xs font-semibold rounded"
                      style={{
                        backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        color: colors.text,
                        border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                      }}
                    >
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className={`text-xs ${colors.textSecondary}`}>+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t text-center" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <p className={`text-xs ${colors.textSecondary}`}>
            Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

