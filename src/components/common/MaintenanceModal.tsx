import React from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';

interface MaintenanceModalProps {
  message?: string;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ message }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  const defaultMessage = 'The system is currently under maintenance. Please check back later.';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: isDark 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <div
        className={glassmorphismClass}
        style={{
          maxWidth: '500px',
          width: '90%',
          padding: '40px',
          borderRadius: '20px',
          border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            : '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          textAlign: 'center',
          background: isDark
            ? 'rgba(26, 26, 46, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.accent}40, ${colors.accent}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${colors.accent}60`,
            }}
          >
            <Wrench size={40} color={colors.accent} />
          </div>
        </div>

        <h2
          style={{
            color: colors.text,
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '16px',
          }}
        >
          System Maintenance
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: isDark
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(239, 68, 68, 0.05)',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}
        >
          <AlertTriangle size={20} color="#ef4444" />
          <p
            style={{
              color: colors.text,
              fontSize: '16px',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            {message || defaultMessage}
          </p>
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <p
            style={{
              color: colors.textSecondary,
              fontSize: '14px',
              margin: 0,
            }}
          >
            We're working hard to improve your experience. The system will be back online shortly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;

