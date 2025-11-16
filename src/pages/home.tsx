import React, { useEffect } from 'react';
import { THEME_CONFIG } from '../components/home/theme';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/home/sections/Header';
import { HeroSection } from '../components/home/sections/HeroSection';
import { HowItWorksSection } from '../components/home/sections/HowItWorksSection';
import { FeaturesSection } from '../components/home/sections/FeaturesSection';
import { IndustrySolutionsSection } from '../components/home/sections/IndustrySolutionsSection';
import { ImpactAndValidationSection } from '../components/home/sections/ImpactAndValidationSection';
import { FAQSection } from '../components/home/sections/FAQSection';
import { PricingSection } from '../components/home/sections/PricingSection';
import { TrustAndSecuritySection } from '../components/home/sections/TrustAndSecuritySection';
import { TestimonialsSection } from '../components/home/sections/TestimonialsSection';
import { PartnersSection } from '../components/home/sections/PartnersSection';
import { CTASignupSection } from '../components/home/sections/CTASignupSection';
import { Footer } from '../components/home/sections/Footer';
import { LiveSystemHealthBar } from '../components/home/sections/LiveSystemHealthBar';

const Homepage = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  // Set theme class on body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }, [isDark]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }} className={isDark ? 'dark-mode' : 'light-mode'}>
      <style>{`
        body { 
          background-color: ${colors.bg}; 
          transition: background-color 0.5s, color 0.5s; 
        }
        html { 
          scroll-behavior: smooth; 
          background-color: ${colors.bg}; 
        }
        .text-shadow-glow {
          text-shadow: ${isDark ? '0 0 5px rgba(79, 163, 255, 0.6), 0 0 15px rgba(79, 163, 255, 0.3)' : 'none'};
        }
        /* Accessibility: Focus styles */
        *:focus-visible {
          outline: 2px solid ${colors.accent};
          outline-offset: 2px;
          border-radius: 4px;
        }
        /* Skip link for screen readers */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: ${colors.accent};
          color: ${isDark ? '#0B1B3B' : '#ffffff'};
          padding: 8px;
          text-decoration: none;
          z-index: 100;
        }
        .skip-link:focus {
          top: 0;
        }
        /* Allow green text to show */
        .save-text-green {
          color: #22c55e !important;
        }
        /* Force animated number color - ensure it respects inline style */
        .animated-number-colored[style*="color"] {
          color: var(--animated-number-color) !important;
        }
        /* Ensure icon colors are visible - only for icons with explicit colors */
        svg[style*="color"] {
          stroke: var(--icon-color, currentColor);
          fill: var(--icon-fill, none);
        }
        
        /* Micro-interactions & Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px ${colors.accent}40;
          }
          50% {
            box-shadow: 0 0 20px ${colors.accent}60;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        /* Smooth hover transitions for all interactive elements */
        button, a, [role="button"] {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        button:hover, a:hover, [role="button"]:hover {
          transform: translateY(-2px);
        }
        button:active, a:active, [role="button"]:active {
          transform: translateY(0);
        }
        
        /* Enhanced focus states for accessibility */
        *:focus-visible {
          outline: 3px solid ${colors.accent};
          outline-offset: 3px;
          border-radius: 6px;
        }
        
        /* Consistent spacing scale */
        .section-spacing {
          padding-top: 6rem;
          padding-bottom: 6rem;
        }
        @media (max-width: 768px) {
          .section-spacing {
            padding-top: 4rem;
            padding-bottom: 4rem;
          }
        }
        
        /* Card hover effects */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.02);
        }
        
        /* Smooth scroll reveal */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header colors={colors} />
      <main id="main-content">
        <HeroSection colors={colors} />
        <HowItWorksSection colors={colors} />
        <FeaturesSection colors={colors} />
      <IndustrySolutionsSection colors={colors} />
      <ImpactAndValidationSection colors={colors} />
      <FAQSection colors={colors} />
      <PricingSection colors={colors} />
      <TrustAndSecuritySection colors={colors} />
      <TestimonialsSection colors={colors} />
      <PartnersSection colors={colors} />
      <CTASignupSection colors={colors} />
      </main>
      <Footer colors={colors} />
      <LiveSystemHealthBar colors={colors} />
    </div>
  );
};

export default Homepage;
