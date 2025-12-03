import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const strength = useMemo(() => {
    const defaultChecks = {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    };

    if (!password) {
      return {
        score: 0,
        label: '',
        color: '',
        percentage: 0,
        checks: defaultChecks,
      };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const labelColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];

    return {
      score,
      label: labels[score - 1] || 'Very Weak',
      color: labelColors[score - 1] || '#ef4444',
      percentage: (score / 5) * 100,
      checks,
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${colors.textSecondary}`}>Password Strength</span>
        <span className="text-sm font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${strength.percentage}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center gap-2 ${strength.checks.length ? 'text-green-500' : colors.textSecondary}`}>
          <span>{strength.checks.length ? '✓' : '○'}</span>
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center gap-2 ${strength.checks.lowercase ? 'text-green-500' : colors.textSecondary}`}>
          <span>{strength.checks.lowercase ? '✓' : '○'}</span>
          <span>Lowercase</span>
        </div>
        <div className={`flex items-center gap-2 ${strength.checks.uppercase ? 'text-green-500' : colors.textSecondary}`}>
          <span>{strength.checks.uppercase ? '✓' : '○'}</span>
          <span>Uppercase</span>
        </div>
        <div className={`flex items-center gap-2 ${strength.checks.number ? 'text-green-500' : colors.textSecondary}`}>
          <span>{strength.checks.number ? '✓' : '○'}</span>
          <span>Number</span>
        </div>
        <div className={`flex items-center gap-2 ${strength.checks.special ? 'text-green-500' : colors.textSecondary}`}>
          <span>{strength.checks.special ? '✓' : '○'}</span>
          <span>Special char</span>
        </div>
      </div>
    </div>
  );
};

