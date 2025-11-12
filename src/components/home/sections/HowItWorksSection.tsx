import React, { useState } from 'react';
import { BarChart3, CloudUpload, TrendingUp, Zap, Info } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { ScrollReveal } from '../ui/ScrollReveal';

export const HowItWorksSection = ({ colors }: { colors: ThemeConfig }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const steps = [
    { title: 'Upload Your Data', description: 'Securely connect data from CSV, JSON, or SQL databases.', icon: CloudUpload, color: 'text-pink-500', tooltip: 'Automatic data validation and cleaning. Supports multiple formats.' },
    { title: 'AI Generates Insights', description: 'Our custom AI model performs instant, complex data analysis.', icon: Zap, color: 'text-cyan-500', tooltip: 'Proprietary ML models trained on millions of data points.' },
    { title: 'View Forecasts & Recommendations', description: 'Access predictive trends and prioritized, easy-to-implement actions.', icon: TrendingUp, color: 'text-green-500', tooltip: 'Get 30-day, 90-day, and annual forecasts with confidence intervals.' },
    { title: 'Track Performance & Optimize', description: 'Monitor key metrics and refine your strategy in real-time.', icon: BarChart3, color: 'text-yellow-500', tooltip: 'Real-time dashboards with customizable widgets and alerts.' },
  ];
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  const CurveConnector = ({ isLeftCard }: { isLeftCard: boolean }) => {
    const curvePath = isLeftCard
      ? "M0 25 C 80 25, 80 50, 150 50"
      : "M150 25 C 70 25, 70 50, 0 50";

    return (
      <div className={`absolute top-0 h-full w-40 z-10 pointer-events-none ${isLeftCard ? 'right-1/2 transform translate-x-1/2' : 'left-1/2 transform -translate-x-1/2'}`}>
        <svg viewBox="0 0 150 100" className="w-full h-full">
          <path
            d={curvePath}
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            opacity="0.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="py-24 transition-colors duration-500" style={{ backgroundColor: colors.bg }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`md:text-5xl text-3xl font-bold mb-16 ${colors.text}`}>How Granalysis Works</h2>
        <div className="relative max-w-4xl mx-auto">
          <div className={`absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 ${colors.isDark ? 'bg-gray-700' : 'bg-gray-300'} z-0 overflow-hidden`}>
            <div className="absolute inset-y-0 w-full" style={{
                backgroundImage: `linear-gradient(to bottom, transparent, ${accentColor} 50%, transparent)`,
                animation: 'glow-line 4s infinite linear',
            }}></div>
          </div>

          {steps.map((step, index) => {
            const isLeftCard = index % 2 === 0;
            const cardAlignment = isLeftCard ? 'mr-auto text-left' : 'ml-auto text-right';
            const offsetPush = isLeftCard ? 'pr-64' : 'pl-64';

            return (
              <ScrollReveal key={index} className={`mb-20 last:mb-0 relative ${offsetPush}`}>
                <div className={`relative z-20 w-full max-w-sm ${cardAlignment} group`}>
                  <div 
                    className={`p-6 ${glassmorphismClass} transition-all duration-300 cursor-pointer ${colors.isDark ? 'hover:shadow-[0_0_30px_rgba(79,163,255,0.4)]' : 'hover:shadow-xl hover:scale-105'} ${hoveredStep === index ? 'scale-105 z-30' : ''}`}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div className={`mb-3 ${isLeftCard ? 'justify-start' : 'justify-end'} flex items-center gap-2`}>
                      <div className={`p-3 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${colors.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <step.icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                      {hoveredStep === index && (
                        <div className={`relative ${isLeftCard ? '' : 'order-first'}`}>
                          <div className={`absolute ${isLeftCard ? 'left-full ml-2' : 'right-full mr-2'} top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs max-w-xs z-50 backdrop-blur-md border transition-all duration-300`}
                            style={{
                              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                              borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                              color: colors.isDark ? '#ffffff' : colors.text
                            }}
                          >
                            {step.tooltip}
                            <div className={`absolute ${isLeftCard ? 'right-full' : 'left-full'} top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent`}
                              style={{
                                [isLeftCard ? 'borderRight' : 'borderLeft']: `8px solid ${colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'}`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className={`text-2xl font-semibold mb-2 ${colors.text} group-hover:${colors.text} transition-colors`}>{step.title}</h3>
                    <p className={`${colors.textSecondary} group-hover:${colors.text} transition-colors`}>{step.description}</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <Info className="w-4 h-4" style={{ color: accentColor }} />
                      <span className={`text-sm font-semibold`} style={{ color: accentColor }}>Hover for details &rarr;</span>
                    </div>
                  </div>
                </div>

                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 p-4 rounded-full border-2 transition-all duration-300 hover:scale-110 cursor-pointer`}
                    style={{ 
                      backgroundColor: colors.bg, 
                      borderColor: accentColor,
                      boxShadow: colors.isDark ? `0 0 20px ${accentColor}` : `0 0 15px rgba(29, 78, 216, 0.3)`
                    }}>
                    <span className={`text-xl font-bold`} style={{ color: accentColor }}>{index + 1}</span>
                </div>

                <CurveConnector isLeftCard={isLeftCard} />
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
};


