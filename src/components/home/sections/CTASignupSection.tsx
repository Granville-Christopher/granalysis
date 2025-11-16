import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../theme';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const CTASignupSection = ({ colors }: { colors: ThemeConfig }) => {
  const [signupsToday, setSignupsToday] = useState(47);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSignupsToday(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-24 transition-colors duration-500 relative overflow-hidden" style={{ background: colors.isDark ? `linear-gradient(360deg, #1A345B 0%, ${colors.bg} 100%)` : `linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)` }}>
      {/* Urgency Badge */}
      <div className="absolute top-8 right-8 animate-pulse">
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${colors.isDark ? 'bg-red-900/40 border border-red-500/40' : 'bg-red-100 border border-red-300'}`}>
          <Clock className="w-4 h-4" style={{ color: '#ef4444', stroke: '#ef4444', '--icon-color': '#ef4444' } as React.CSSProperties} />
          <span className={`md:text-sm text-xs font-bold ${colors.isDark ? 'text-red-400' : 'text-red-700'}`}>
            Limited Time: 20% Off Annual Plans
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 text-center max-w-3xl relative z-10">
        <h2 className={`md:text-6xl text-3xl font-extrabold mb-6 ${colors.isDark ? colors.text : 'text-white'}`}>
          Ready to See Your Future?
        </h2>
        <p className={`md:text-2xl text-base mb-6 ${colors.isDark ? colors.textSecondary : 'text-white/90'}`}>
          Start for free and gain immediate clarity on your sales performance. No credit card required.
        </p>

        {/* Social Proof Counter */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${colors.isDark ? 'bg-white/5 border border-white/10' : 'bg-white/20 border border-white/30 backdrop-blur-sm'}`}>
          <Users className="w-4 h-4" style={{ color: colors.isDark ? colors.accent : '#ffffff' }} />
          <span className={`md:text-sm text-xs font-semibold ${colors.isDark ? colors.text : 'text-white'}`}>
            <span style={{ color: colors.isDark ? colors.accent : '#ffffff' }}><AnimatedNumber endValue={signupsToday} /></span> signed up today
          </span>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e', stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.3)', '--icon-color': '#22c55e', '--icon-fill': 'rgba(34, 197, 94, 0.3)' } as React.CSSProperties} />
            <span className={`md:text-sm text-xs ${colors.isDark ? colors.textSecondary : 'text-white/90'}`}>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e', stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.3)', '--icon-color': '#22c55e', '--icon-fill': 'rgba(34, 197, 94, 0.3)' } as React.CSSProperties} />
            <span className={`md:text-sm text-xs ${colors.isDark ? colors.textSecondary : 'text-white/90'}`}>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e', stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.3)', '--icon-color': '#22c55e', '--icon-fill': 'rgba(34, 197, 94, 0.3)' } as React.CSSProperties} />
            <span className={`md:text-sm text-xs ${colors.isDark ? colors.textSecondary : 'text-white/90'}`}>Setup in 2 minutes</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button colors={colors} className="md:text-lg text-base px-8 py-4 relative">
            <Sparkles className="w-5 h-5 inline mr-2" style={{ color: '#fbbf24', stroke: '#fbbf24', fill: 'rgba(251, 191, 36, 0.3)', '--icon-color': '#fbbf24', '--icon-fill': 'rgba(251, 191, 36, 0.3)' } as React.CSSProperties} />
            Get Started Free Today
          </Button>
          <Button glow={false} variant="secondary" colors={colors} className="md:text-lg text-base px-8 py-4">
            View All Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

