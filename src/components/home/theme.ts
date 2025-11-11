import { LucideIcon } from 'lucide-react';

export const DARK_ACCENT = '#4FA3FF';
export const LIGHT_ACCENT = '#1D4ED8';

export const THEME_CONFIG = {
  dark: {
    bg: '#0B1B3B',
    secondaryBg: '#1A345B',
    text: 'text-white',
    textSecondary: 'text-gray-300', // Improved contrast from gray-400
    accent: DARK_ACCENT,
    glassBg: 'bg-white/5',
    glassBorder: 'border-white/10',
    headerBg: 'rgba(11, 27, 59, 0.4)',
    headerScrolled: 'rgba(11, 27, 59, 0.85)',
    cardShadow: `0 0 10px rgba(79, 163, 255, 0.2), 0 0 20px rgba(0, 0, 0, 0.4)`,
    isDark: true,
  },
  light: {
    bg: '#F9FAFB', // Lighter for better contrast
    secondaryBg: '#FFFFFF',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700', // Improved contrast from gray-600
    accent: LIGHT_ACCENT,
    glassBg: 'bg-white/90', // More opaque for better readability
    glassBorder: 'border-gray-300',
    headerBg: 'rgba(255, 255, 255, 0.8)',
    headerScrolled: 'rgba(255, 255, 255, 0.98)',
    cardShadow: `0 4px 20px rgba(0, 0, 0, 0.12), 0 0 10px rgba(29, 78, 216, 0.15)`, // Enhanced shadow
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


