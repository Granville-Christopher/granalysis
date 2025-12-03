import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import { Confetti } from './Confetti';

interface FeatureAnnouncementProps {
  id: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export const FeatureAnnouncement: React.FC<FeatureAnnouncementProps> = ({
  id,
  title,
  message,
  action,
  dismissible = true,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`announcement_${id}_dismissed`);
    if (!dismissed) {
      setIsVisible(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`announcement_${id}_dismissed`, 'true');
  };

  if (!isVisible) return null;

  return (
    <>
      <Confetti trigger={showConfetti} duration={3000} />
      <div
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${glassmorphismClass} rounded-xl shadow-2xl p-4 max-w-md w-full mx-4`}
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `2px solid ${colors.accent}40`,
          boxShadow: `0 8px 32px ${colors.accent}20`,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.accent}20` }}>
            <Sparkles className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold mb-1 ${colors.text}`}>{title}</h3>
            <p className={`text-sm mb-3 ${colors.textSecondary}`}>{message}</p>
            {action && (
              <button
                onClick={action.onClick}
                className="px-4 py-2 rounded-lg font-medium text-white text-sm"
                style={{ backgroundColor: colors.accent }}
              >
                {action.label}
              </button>
            )}
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={`p-1 rounded hover:bg-white/10 ${colors.textSecondary}`}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

