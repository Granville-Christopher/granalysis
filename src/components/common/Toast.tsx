import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig } from '../home/theme';
import { toast as globalToast, Toast as GlobalToast } from '../../utils/toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: isDark 
      ? 'rgba(34, 197, 94, 0.15)' 
      : 'rgba(34, 197, 94, 0.1)',
    error: isDark 
      ? 'rgba(239, 68, 68, 0.15)' 
      : 'rgba(239, 68, 68, 0.1)',
    warning: isDark 
      ? 'rgba(234, 179, 8, 0.15)' 
      : 'rgba(234, 179, 8, 0.1)',
    info: isDark 
      ? 'rgba(59, 130, 246, 0.15)' 
      : 'rgba(59, 130, 246, 0.1)',
  };

  const borderColors = {
    success: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
    error: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
    warning: isDark ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.2)',
    info: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
  };

  return (
    <div
      className={`fixed z-50 min-w-[300px] max-w-md rounded-lg shadow-lg p-4 flex items-start gap-3 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{
        top: '100px', // Below header (72px) with some spacing
        right: '24px', // Same as ChatAssistant FAB for alignment
        backgroundColor: isDark 
          ? `rgba(11, 27, 59, 0.95)` 
          : `rgba(255, 255, 255, 0.95)`,
        border: `1px solid ${borderColors[toast.type]}`,
        backdropFilter: 'blur(20px)',
        boxShadow: colors.cardShadow,
        position: 'relative',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Type-specific color overlay */}
      <div
        className="absolute inset-0 rounded-lg opacity-10 pointer-events-none"
        style={{
          backgroundColor: toast.type === 'success' ? '#22c55e' :
                          toast.type === 'error' ? '#ef4444' :
                          toast.type === 'warning' ? '#eab308' :
                          '#3b82f6', // info
        }}
      />
      <div className="relative z-10 flex items-start gap-3 w-full">
        {icons[toast.type]}
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text}`}>{toast.message}</p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
          style={{ color: colors.textSecondary }}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div 
      className="fixed z-50 space-y-2 pointer-events-none"
      style={{
        top: '100px', // Below header (72px) with some spacing
        right: '24px', // Same as ChatAssistant FAB for alignment
      }}
    >
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{
            marginTop: index > 0 ? '8px' : '0',
          }}
        >
          <ToastComponent toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

// Toast Manager Hook - now uses global toast manager
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Subscribe to global toast manager
    const unsubscribe = globalToast.subscribe((globalToasts: GlobalToast[]) => {
      setToasts(globalToasts as Toast[]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    return globalToast.show(message, type, duration);
  };

  const removeToast = (id: string) => {
    globalToast.remove(id);
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string, duration?: number) => globalToast.success(message, duration),
    error: (message: string, duration?: number) => globalToast.error(message, duration),
    warning: (message: string, duration?: number) => globalToast.warning(message, duration),
    info: (message: string, duration?: number) => globalToast.info(message, duration),
  };
};

