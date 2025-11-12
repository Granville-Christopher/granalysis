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
    <div className="py-24 transition-colors duration-500 relative overflow-hidden" style={{ background: colors.isDark ? `linear-gradient(360deg, #1A345B 0%, ${colors.bg} 100%)` : `linear-gradient(180deg, #FFFFFF 0%, ${colors.bg} 100%)` }}>
      {/* Urgency Badge */}
      <div className="absolute top-8 right-8 animate-pulse">
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${colors.isDark ? 'bg-red-900/40 border border-red-500/40' : 'bg-red-100 border border-red-300'}`}>
          <Clock className="w-4 h-4 text-red-500" />
          <span className={`md:text-sm text-xs font-bold ${colors.isDark ? 'text-red-400' : 'text-red-700'}`}>
            Limited Time: 20% Off Annual Plans
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 text-center max-w-3xl relative z-10">
        <h2 className={`md:text-6xl text-3xl font-extrabold mb-6 ${colors.text}`}>
          Ready to See Your Future?
        </h2>
        <p className={`md:text-2xl text-base mb-6 ${colors.textSecondary}`}>
          Start for free and gain immediate clarity on your sales performance. No credit card required.
        </p>

        {/* Social Proof Counter */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${colors.isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
          <Users className="w-4 h-4" style={{ color: colors.accent }} />
          <span className={`md:text-sm text-xs font-semibold ${colors.text}`}>
            <span style={{ color: colors.accent }}><AnimatedNumber endValue={signupsToday} /></span> signed up today
          </span>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={`md:text-sm text-xs ${colors.textSecondary}`}>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={`md:text-sm text-xs ${colors.textSecondary}`}>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={`md:text-sm text-xs ${colors.textSecondary}`}>Setup in 2 minutes</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button colors={colors} className="md:text-lg text-base px-8 py-4 relative">
            <Sparkles className="w-5 h-5 inline mr-2" />
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


