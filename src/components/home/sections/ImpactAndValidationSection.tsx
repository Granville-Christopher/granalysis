import React, { useState } from 'react';
import { Sparkles, TrendingUp, FileText } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';
import { CaseStudiesModal } from './IndustrySolutionsSection';

export const ImpactAndValidationSection = ({ colors }: { colors: ThemeConfig }) => {
  const [isCaseStudiesModalOpen, setIsCaseStudiesModalOpen] = useState(false);
  const metrics = [
    { label: 'Total Value Generated', value: 120, unit: 'B', prefix: '$', color: 'text-green-500', icon: TrendingUp },
    { label: 'Forecast Accuracy Improvement', value: 38, unit: '%', prefix: '+', color: 'text-cyan-500', icon: TrendingUp },
    { label: 'Reduction in Data Prep Time', value: 95, unit: '%', prefix: '~', color: 'text-pink-500', icon: TrendingUp },
  ];
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;
  const clientLogos = [
    { name: 'Zenith Capital', logo: 'ZC' },
    { name: 'Aether Dynamics', logo: 'AD' },
    { name: 'Global Tech Solutions', logo: 'GTS' },
    { name: 'Apex Logistics', logo: 'AL' },
    { name: 'Future Bank', logo: 'FB' },
    { name: 'Innovate Labs', logo: 'IL' }
  ];

  return (
    <div className="py-24 transition-colors duration-500" id="impact" style={{ background: colors.isDark ? `linear-gradient(180deg, ${colors.bg} 0%, #081630 100%)` : `linear-gradient(180deg, ${colors.bg} 0%, #FFFFFF 100%)` }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-5xl font-bold mb-4 ${colors.text}`}>Proven Impact & Client Validation</h2>
        <p className={`text-xl mb-16 ${colors.textSecondary}`}>Results are the only metric that matters. See what we deliver.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {metrics.map((m, index) => (
            <ScrollReveal key={index}>
              <div className={`p-8 ${glassmorphismClass} flex flex-col items-center justify-center h-full transition-all duration-300 hover:scale-105 ${colors.isDark ? 'hover:shadow-[0_0_30px_rgba(79,163,255,0.4)]' : 'hover:shadow-xl'}`}>
                <div className="relative mb-4">
                  <Sparkles className={`w-10 h-10 ${m.color} transition-transform duration-300`} />
                  <m.icon className={`w-6 h-6 absolute -bottom-1 -right-1 ${m.color}`} />
                </div>
                <p className={`text-6xl ${colors.text} mb-2 tracking-tighter font-mono`}>
                  {m.prefix}
                  <AnimatedNumber
                    endValue={m.value}
                    decimals={m.unit === 'B' ? 1 : 0}
                    duration={3000}
                    startValue={0}
                  />
                  <span className="text-3xl">{m.unit}</span>
                </p>
                <p className={`text-lg uppercase font-medium tracking-wider mt-2 ${colors.textSecondary}`}>{m.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-20">
          <h3 className={`text-2xl font-semibold mb-4 ${colors.text}`}>Trusted by Fortune 500 Innovators</h3>
          <p className={`text-lg mb-8 ${colors.textSecondary}`}>Join industry leaders transforming their sales operations</p>
          <ScrollReveal>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 mb-12">
              {clientLogos.map((client, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg transition-all duration-300 cursor-pointer ${colors.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
                  title={client.name}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-transform duration-300 hover:scale-110`}
                    style={{ 
                      backgroundColor: accentColor,
                      color: colors.isDark ? '#0B1B3B' : 'white'
                    }}
                  >
                    {client.logo}
                  </div>
                  <p className={`text-xs mt-2 text-center ${colors.textSecondary}`}>{client.name}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <div className="text-center">
            <Button 
              colors={colors}
              onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                e?.preventDefault();
                e?.stopPropagation();
                setIsCaseStudiesModalOpen(true);
              }}
              className="inline-flex items-center gap-2"
            >
              <p className="flex justify-center gap-2">
                <FileText className="w-4 h-4" />
                View Case Studies
              </p>
            </Button>
          </div>
        </div>
      </div>
      <CaseStudiesModal 
        isOpen={isCaseStudiesModalOpen}
        onClose={() => setIsCaseStudiesModalOpen(false)}
        colors={colors}
      />
    </div>
  );
};


