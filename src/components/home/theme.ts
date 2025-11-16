import { LucideIcon } from 'lucide-react';

export const DARK_ACCENT = '#4FA3FF';
export const LIGHT_ACCENT = '#1D4ED8';

export const THEME_CONFIG = {
  dark: {
    bg: '#0B1B3B', // Deep blue
    secondaryBg: '#1A345B',
    text: 'text-white',
    textSecondary: 'text-gray-200',
    accent: DARK_ACCENT,
    glassBg: 'bg-white/5',
    glassBorder: 'border-white/10',
    headerBg: 'rgba(11, 27, 59, 0.8)',
    headerScrolled: 'rgba(11, 27, 59, 0.95)',
    cardShadow: 'none', // No glow
    isDark: true,
  },
  light: {
    bg: '#FFFFFF',
    secondaryBg: '#F8F9FA',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: LIGHT_ACCENT,
    glassBg: 'bg-white/90',
    glassBorder: 'border-gray-200/80',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerScrolled: 'rgba(255, 255, 255, 0.98)',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    isDark: false,
  }
};

export type Theme = 'light' | 'dark';
export type ThemeConfig = typeof THEME_CONFIG.dark;

export interface PricingTier {
  title: string;
  price: number;
  description: string;
  features: string[];
  isHighlighted: boolean;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DetailedUseCase {
  title: string;
  description: string;
  tags: string[];
}

export interface IndustryDetail {
  industry: string;
  icon: LucideIcon;
  color: string;
  details: DetailedUseCase[];
}

export const getGlassmorphismClass = (colors: ThemeConfig) => {
  const isDark = colors.isDark;
  return `backdrop-blur-md rounded-2xl shadow-lg transition-all duration-300 ${isDark ? colors.glassBg + ' ' + colors.glassBorder + ' border' : colors.glassBg + ' border border-gray-200'}`;
};

