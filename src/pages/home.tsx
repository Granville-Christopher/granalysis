import React, { useState } from 'react';
import { THEME_CONFIG, Theme } from '../components/home/theme';
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
  const [theme, setTheme] = useState<Theme>('dark');
  const colors = theme === 'dark' ? THEME_CONFIG.dark : THEME_CONFIG.light;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        body { background-color: ${colors.bg}; transition: background-color 0.5s; }
        html { scroll-behavior: smooth; }
        .text-shadow-glow {
          text-shadow: ${colors.isDark ? "0 0 5px rgba(79, 163, 255, 0.6), 0 0 15px rgba(79, 163, 255, 0.3)" : "none"};
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
          color: ${colors.isDark ? '#0B1B3B' : 'white'};
          padding: 8px;
          text-decoration: none;
          z-index: 100;
        }
        .skip-link:focus {
          top: 0;
        }
        /* Improved contrast for light mode */
        ${!colors.isDark ? `
          a:hover, button:hover {
            opacity: 0.9;
          }
          .text-gray-600 {
            color: #374151 !important;
          }
        ` : ''}
      `}</style>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header theme={theme} toggleTheme={toggleTheme} colors={colors} />
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
 