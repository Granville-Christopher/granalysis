import React, { useState } from 'react';
import { Clock, Zap, Play, ExternalLink } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { LineChart } from '../charts/LineChart';
import { healthMetrics } from '../data';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';

export const DashboardPreviewSection = ({ colors }: { colors: ThemeConfig }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const accentColor = colors.accent;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const innerCardBg = colors.isDark ? 'bg-black/10' : 'bg-gray-50/50 border border-gray-100';
  const glowStyle = { boxShadow: colors.cardShadow };

  const StatBlock = ({ icon: Icon, value, label }: { icon: any; value: string; label: string }) => (
    <div className={`flex flex-col items-center p-4 ${colors.text} transition-transform duration-300 hover:scale-110`}>
      <Icon className={`w-10 h-10 mb-2 transition-colors duration-300`} style={{ color: accentColor }} />
      <div className={`text-4xl font-extrabold text-shadow-glow`} style={{ color: accentColor }}>{value}</div>
      <div className={`text-sm font-light uppercase tracking-wider mt-1 ${colors.textSecondary}`}>{label}</div>
    </div>
  );

  return (
    <div className="py-24 transition-colors duration-500" style={{ backgroundColor: colors.secondaryBg }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-5xl font-bold mb-4 ${colors.text}`}>See It In Action</h2>
        <p className={`text-xl mb-4 ${colors.textSecondary}`}>The future of data analysis lives on your interactive dashboard.</p>
        <div className="mb-12">
          <Button 
            colors={colors} 
            onClick={() => window.open('/signup', '_blank')}
            className="inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Try Interactive Demo
          </Button>
        </div>

        <ScrollReveal>
          <div className={`p-8 ${glassmorphismClass} transition-all duration-300 ${colors.isDark ? 'hover:shadow-[0_0_40px_rgba(79,163,255,0.5)]' : 'hover:shadow-2xl'}`} id="dashboard-preview" style={{ ...glowStyle, maxWidth: '1200px', margin: '0 auto' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 space-y-4">
                <div 
                  className={`p-4 rounded-xl ${innerCardBg} transition-all duration-300 cursor-pointer ${hoveredCard === 'sales' ? 'scale-105' : ''}`}
                  onMouseEnter={() => setHoveredCard('sales')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={hoveredCard === 'sales' ? {
                    boxShadow: colors.isDark ? `0 0 20px ${accentColor}` : `0 4px 15px rgba(29, 78, 216, 0.2)`
                  } : {}}
                >
                  <p className={`text-sm uppercase ${colors.textSecondary}`}>Total Sales (YTD)</p>
                  <p className={`text-5xl font-extrabold transition-colors duration-300`} style={{ color: accentColor }}>$<AnimatedNumber endValue={245000} /></p>
                </div>
                <div 
                  className={`p-4 rounded-xl ${innerCardBg} transition-all duration-300 cursor-pointer ${hoveredCard === 'accuracy' ? 'scale-105' : ''}`}
                  onMouseEnter={() => setHoveredCard('accuracy')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={hoveredCard === 'accuracy' ? {
                    boxShadow: colors.isDark ? `0 0 20px ${accentColor}` : `0 4px 15px rgba(29, 78, 216, 0.2)`
                  } : {}}
                >
                  <p className={`text-sm uppercase ${colors.textSecondary}`}>Forecast Accuracy</p>
                  <p className={`text-5xl font-extrabold text-cyan-500 transition-colors duration-300`}><AnimatedNumber endValue={94} />%</p>
                </div>
                <div 
                  className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${hoveredCard === 'recommendation' ? 'scale-105' : ''} ${colors.isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50/50 border-red-300'}`}
                  onMouseEnter={() => setHoveredCard('recommendation')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={hoveredCard === 'recommendation' ? {
                    boxShadow: colors.isDark ? `0 0 25px rgba(239, 68, 68, 0.4)` : `0 4px 15px rgba(239, 68, 68, 0.2)`
                  } : {}}
                >
                  <h4 className={`text-lg font-semibold flex items-center mb-2 ${colors.isDark ? 'text-red-400' : 'text-red-700'}`}>
                    <Zap className="w-5 h-5 mr-2" /> AI Recommendation
                  </h4>
                  <p className={`text-sm ${colors.textSecondary}`}>
                    Target <strong>Product B</strong> promotions this week. Insight shows 30% lower conversion due to price sensitivity.
                  </p>
                </div>
              </div>

              <div 
                className={`col-span-2 p-4 rounded-xl h-96 flex flex-col ${innerCardBg} transition-all duration-300 ${hoveredCard === 'chart' ? 'scale-[1.02]' : ''}`}
                onMouseEnter={() => setHoveredCard('chart')}
                onMouseLeave={() => setHoveredCard(null)}
                style={hoveredCard === 'chart' ? {
                  boxShadow: colors.isDark ? `0 0 30px ${accentColor}` : `0 8px 25px rgba(29, 78, 216, 0.2)`
                } : {}}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`text-lg font-semibold ${colors.text}`}>Monthly Revenue Trend</h4>
                  <button className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
                    style={{ 
                      color: accentColor,
                      backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.1)'
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Explore
                  </button>
                </div>
                <div className={`flex justify-center space-x-6 mb-4 text-sm ${colors.textSecondary}`}>
                  {['Product A', 'Product B', 'Product C'].map((product) => (
                    <div key={product} className="flex items-center transition-transform duration-300 hover:scale-110 cursor-pointer">
                      <div className="w-3 h-3 rounded-full mr-2 transition-all duration-300" style={{ backgroundColor: colors.accent }}></div>
                      {product}
                    </div>
                  ))}
                </div>
                <div className="flex-grow h-0">
                  <LineChart colors={colors} />
                </div>
              </div>

              <div className={`col-span-1 md:col-span-3 p-4 rounded-xl ${innerCardBg}`}>
                <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>Platform Health Status</h4>
                <div className="flex justify-around items-center h-24">
                  {healthMetrics.map((m, index) => (
                    <StatBlock
                        key={index}
                        icon={Clock}
                        label={m.label}
                        value={m.value}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};


