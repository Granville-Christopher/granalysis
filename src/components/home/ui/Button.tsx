import React from 'react';
import { ThemeConfig, THEME_CONFIG } from '../theme';

const getButtonGlowClass = (colors: ThemeConfig) => {
  return `group relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium ${colors.text} rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-800 transition-all duration-300`;
};

export const Button = ({ children, className = '', glow = true, variant = 'primary', onClick = () => {}, colors, gradientHover = false, type, style }: { children: React.ReactNode; className?: string; glow?: boolean; variant?: 'primary' | 'secondary'; onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void, colors: ThemeConfig, gradientHover?: boolean, type?: 'button' | 'submit' | 'reset', style?: React.CSSProperties }) => {
  const accentColor = colors.accent;

  let primaryBg: string;
  let textClass: string;
  let bgImage: string;
  let hoverClass: string;

  if (gradientHover && !colors.isDark) {
    primaryBg = 'bg-transparent';
    textClass = 'text-gray-900';
    bgImage = `linear-gradient(45deg, ${accentColor}, ${THEME_CONFIG.dark.bg})`;
    hoverClass = 'group-hover:!text-white';
  } else {
    primaryBg = colors.isDark ? `bg-[${colors.bg}]` : `bg-white`;
    textClass = colors.isDark ? colors.text : 'text-gray-900';
    bgImage = `linear-gradient(45deg, ${accentColor}, ${colors.bg})`;
    hoverClass = colors.isDark ? 'group-hover:bg-opacity-80' : '';
  }

  if (glow) {
    const spanStyle = gradientHover && !colors.isDark 
      ? { 
          color: 'rgb(17, 24, 39)', // text-gray-900
          transition: 'color 0.3s ease-in-out'
        } 
      : undefined;
    
    return (
      <button
        type={type || 'button'}
        onClick={onClick}
        className={`${getButtonGlowClass(colors)} ${className}`}
        style={style}
        onMouseEnter={(e) => {
          if (gradientHover && !colors.isDark) {
            const span = e.currentTarget.querySelector('span:last-child') as HTMLElement;
            if (span) span.style.color = 'white';
          }
        }}
        onMouseLeave={(e) => {
          if (gradientHover && !colors.isDark) {
            const span = e.currentTarget.querySelector('span:last-child') as HTMLElement;
            if (span) span.style.color = 'rgb(17, 24, 39)';
          }
        }}
      >
        <span className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{
          backgroundImage: bgImage,
          zIndex: 0
        }}></span>
        <span className={`relative px-5 py-2.5 transition-all ease-in duration-75 bg-transparent rounded-md ${textClass} ${hoverClass}`} style={{...spanStyle, zIndex: 1}}>
          {children}
        </span>
      </button>
    );
  }

  const primaryClasses = `bg-[${accentColor}] ${colors.isDark ? 'text-black' : 'text-gray-900'} hover:bg-opacity-80`;
  const secondaryClasses = `bg-transparent border border-[${accentColor}] text-[${accentColor}] hover:bg-white/10`;

  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold ${variant === 'primary' ? primaryClasses : secondaryClasses} transition-all duration-300 ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};


