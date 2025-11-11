import React, { useState } from 'react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';
import { ExternalLink, Info } from 'lucide-react';

export const PartnersSection = ({ colors }: { colors: ThemeConfig }) => {
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
  const logos = [
    { name: 'HubSpot', category: 'CRM', description: 'Sync customer data and sales pipelines' },
    { name: 'Salesforce', category: 'CRM', description: 'Real-time sales data integration' },
    { name: 'Shopify', category: 'E-commerce', description: 'E-commerce analytics and insights' },
    { name: 'AWS', category: 'Infrastructure', description: 'Cloud infrastructure and storage' },
    { name: 'OpenAI', category: 'AI', description: 'Advanced AI model integration' },
    { name: 'Google Cloud', category: 'Infrastructure', description: 'Enterprise cloud services' }
  ];
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  const categories = ['All', 'CRM', 'E-commerce', 'Infrastructure', 'AI'];

  return (
    <div className="py-24 transition-colors duration-500" style={{ background: colors.isDark ? `linear-gradient(180deg, #1A345B 0%, ${colors.bg} 100%)` : `linear-gradient(180deg, #FFFFFF 0%, ${colors.bg} 100%)` }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-5xl font-bold mb-4 ${colors.text}`}>Our Partners & Integrations</h2>
        <p className={`text-xl mb-12 ${colors.textSecondary}`}>Seamlessly connect with your existing tools</p>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <ScrollReveal>
          <div className="relative overflow-hidden py-4 mb-12">
            <div className="flex whitespace-nowrap animate-scroll">
              {[...logos, ...logos].map((logo, index) => (
                <div 
                  key={index} 
                  className={`inline-block mx-8 p-6 ${glassmorphismClass} cursor-pointer transition-all duration-300 relative group ${colors.isDark ? 'hover:shadow-[0_0_25px_rgba(79,163,255,0.7)]' : 'hover:shadow-[0_0_15px_rgba(29,78,216,0.3)]'}`}
                  onMouseEnter={() => setHoveredLogo(logo.name)}
                  onMouseLeave={() => setHoveredLogo(null)}
                >
                  <span className={`text-3xl font-extrabold opacity-70 transition-opacity duration-300 group-hover:opacity-100 ${colors.text}`}>{logo.name}</span>
                  {hoveredLogo === logo.name && (
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs max-w-xs z-50 backdrop-blur-md border transition-all duration-300 whitespace-normal`}
                      style={{
                        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                        color: colors.text
                      }}
                    >
                      <div className="font-semibold mb-1">{logo.category}</div>
                      <div className={colors.textSecondary}>{logo.description}</div>
                      <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4`}
                        style={{
                          borderTopColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          `}</style>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <span className={`px-4 py-2 text-sm font-semibold rounded-full border border-green-500/50 ${colors.isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100/50 text-green-700'}`}>Powered by AI</span>
          <span className={`px-4 py-2 text-sm font-semibold rounded-full border border-yellow-500/50 ${colors.isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100/50 text-yellow-700'}`}>Secure by Google Cloud</span>
        </div>

        <div className="mt-12">
          <Button 
            colors={colors}
            variant="secondary"
            onClick={() => window.location.href = '#integrations'}
            className="inline-flex items-center gap-2"
          >
            <p className="flex justify-center gap-2">
              <Info className="w-4 h-4" />
              Request Integration
              <ExternalLink className="w-4 h-4" />
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
};


