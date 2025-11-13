import React from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'files' | 'rows' | 'export';
  currentTier: string;
  requiredTier?: string;
  exportType?: 'csv' | 'excel' | 'pdf' | 'sql';
  nonDismissible?: boolean; // For payment failure scenarios - cannot be closed
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  limitType,
  currentTier,
  requiredTier,
  exportType,
  nonDismissible = false,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const navigate = useNavigate();
  const glassmorphismClass = getGlassmorphismClass(colors);

  if (!isOpen) return null;

  const getLimitMessage = () => {
    if (limitType === 'files') {
      return 'You have reached your monthly file upload limit.';
    } else if (limitType === 'rows') {
      return 'This file exceeds the maximum rows allowed for your plan.';
    } else if (limitType === 'export') {
      const exportNames: Record<string, string> = {
        csv: 'CSV',
        excel: 'Excel',
        pdf: 'PDF',
        sql: 'SQL/API'
      };
      const exportName = exportNames[exportType || 'csv'] || 'this format';
      return `Export to ${exportName} is not available on your current plan.`;
    }
    return 'This action requires a higher tier plan.';
  };

  const limitMessage = getLimitMessage();

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur - only clickable if dismissible */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
        onClick={nonDismissible ? undefined : onClose}
        style={{ cursor: nonDismissible ? 'default' : 'pointer' }}
      />

      {/* Modal */}
      <div
        className={`relative ${glassmorphismClass} p-8 max-w-md w-full transform transition-all duration-300`}
        style={{
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), ${colors.cardShadow}`,
        }}
      >
        {/* Close button - only show if dismissible */}
        {!nonDismissible && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              colors.isDark
                ? 'hover:bg-white/10 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto"
          style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
            boxShadow: `0 0 20px ${colors.accent}40`,
          }}
        >
          <Zap className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold text-center mb-4 ${colors.text}`}>
          {nonDismissible ? 'Payment Required' : 'Plan Limit Reached'}
        </h2>

        {/* Message */}
        <p className={`text-center mb-2 ${colors.textSecondary}`}>
          {limitMessage}
        </p>
        <p className={`text-center mb-6 ${colors.textSecondary}`}>
          Please upgrade your plan to continue.
        </p>

        {/* Current tier info */}
        <div
          className={`p-4 rounded-xl mb-6 ${
            colors.isDark ? 'bg-white/5' : 'bg-gray-100'
          }`}
        >
          <p className={`text-sm ${colors.textSecondary} mb-1`}>Current Plan</p>
          <p className={`text-lg font-semibold ${colors.text}`}>
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Tier
          </p>
        </div>

        {/* Upgrade button */}
        <button
          onClick={handleUpgrade}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
            colors.isDark
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }`}
          style={{
            boxShadow: `0 4px 15px ${colors.accent}40`,
          }}
        >
          <span>Upgrade Plan</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Cancel button - only show if dismissible */}
        {!nonDismissible && (
          <button
            onClick={onClose}
            className={`w-full mt-3 py-2 px-6 rounded-xl font-medium transition-colors ${
              colors.isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Maybe Later
          </button>
        )}
        {nonDismissible && (
          <p className={`text-center mt-4 text-sm ${colors.textSecondary}`}>
            Please upgrade your plan to continue using the platform.
          </p>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;

