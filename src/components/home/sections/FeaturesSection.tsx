import React, { useState } from 'react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { featureCards } from '../data';
import { ScrollReveal } from '../ui/ScrollReveal';
import { ChevronDown, Sparkles } from 'lucide-react';

export const FeaturesSection = ({ colors }: { colors: ThemeConfig }) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  const featureDetails: Record<number, string> = {
    0: 'Support for CSV, JSON, Excel, and direct database connections. Automatic data validation and cleaning.',
    1: 'Powered by proprietary machine learning models trained on millions of sales data points. Real-time processing.',
    2: 'Get 30-day, 90-day, and annual forecasts with confidence intervals. Receive prioritized action items.',
    3: 'Fully customizable dashboards with drag-and-drop widgets. Real-time updates and collaborative sharing.'
  };

  return (
    <div className="py-24 transition-colors duration-500" id="features" style={{ backgroundColor: colors.bg }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`md:text-5xl text-3xl font-bold mb-4 ${colors.text}`}>Core Platform Features</h2>
        <p className={`md:text-xl text-base mb-16 ${colors.textSecondary}`}>Everything you need to transform data into actionable insights</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {featureCards.map((card, index) => {
            const isExpanded = expandedCard === index;
            const isNew = index === 1;
            const isPopular = index === 2;
            
            return (
              <ScrollReveal key={index} className="h-full">
                <div 
                  className={`p-6 ${glassmorphismClass} group flex flex-col items-start text-left cursor-pointer transition-all duration-300 h-full relative ${colors.isDark ? 'hover:shadow-[0_0_30px_rgba(79,163,255,0.5)]' : 'hover:shadow-xl hover:border-blue-400'} ${isExpanded ? 'scale-105 z-10' : ''}`}
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                >
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {isNew && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors.isDark ? 'bg-green-900/40 text-green-400 border border-green-500/40' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        New
                      </span>
                    )}
                    {isPopular && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors.isDark ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/40' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                        Popular
                      </span>
                    )}
                  </div>

                  <div className={`p-3 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} 
                    style={{ 
                      backgroundColor: accentColor, 
                      boxShadow: colors.isDark ? `0 0 15px ${accentColor}` : `0 4px 10px rgba(29, 78, 216, 0.3)`
                    }}>
                    <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className={`md:text-2xl text-lg font-semibold mb-2 ${colors.text} group-hover:${colors.text} transition-colors`}>{card.title}</h3>
                  <p className={`${colors.textSecondary} flex-grow transition-colors`}>{card.description}</p>
                  
                  {/* Expandable Content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                    <p className={`text-sm ${colors.textSecondary} mb-4`}>{featureDetails[index]}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Advanced', 'Secure', 'Fast'].map((tag, i) => (
                        <span 
                          key={i}
                          className={`px-2 py-1 text-xs rounded-full ${colors.isDark ? 'bg-white/10' : 'bg-gray-100'}`}
                          style={{ color: accentColor }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between w-full">
                    <span className={`text-sm font-semibold transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ color: accentColor }}>
                      {isExpanded ? 'Show Less' : 'Learn More'} <ChevronDown className={`w-4 h-4 inline transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
};


