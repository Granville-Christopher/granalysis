import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Users, Zap, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { LineChart } from '../charts/LineChart';
import { healthMetrics } from '../data';

export const HeroSection = ({ colors }: { colors: ThemeConfig }) => {
  const accentColor = colors.accent;
  const [liveStats, setLiveStats] = useState({ insights: 2341, users: 5234, accuracy: 94 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const glassmorphismClass = getGlassmorphismClass(colors);
  const innerCardBg = colors.isDark ? 'bg-black/10' : 'bg-gray-50/50 border border-gray-100';
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        insights: prev.insights + Math.floor(Math.random() * 3),
        users: prev.users + Math.floor(Math.random() * 2),
        accuracy: prev.accuracy
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const StatBlock = ({ icon: Icon, value, label }: { icon: any; value: string; label: string }) => (
    <div className={`flex flex-col items-center p-4 ${colors.text} transition-transform duration-300 hover:scale-110`}>
      <Icon className={`w-5 h-5 md:w-10 md:h-10 mb-2 transition-colors duration-300`} style={{ color: accentColor }} />
      <div className={`text-2xl md:text-4xl font-extrabold text-shadow-glow`} style={{ color: accentColor }}>{value}</div>
      <div className={`text-xs md:text-sm font-light uppercase tracking-wider mt-1 ${colors.textSecondary}`}>{label}</div>
    </div>
  );

  const glowStyle = { textShadow: colors.isDark ? `0 0 10px ${accentColor}, 0 0 20px rgba(79, 163, 255, 0.5)` : 'none' };

  const heroBackground = colors.isDark
    ? `radial-gradient(ellipse at center, #1A345B 0%, ${colors.bg} 100%)`
    : `linear-gradient(180deg, #F9FAFB 0%, ${colors.bg} 100%)`;

  const networkGlow = colors.isDark ? '#4FA3FF' : '#1D4ED8';

  return (
    <div
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-40 md:pt-24 lg:pt-32 transition-colors duration-500"
      style={{ background: heroBackground }}
    >
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-20 z-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: colors.isDark
            ? `radial-gradient(circle, ${networkGlow} 1px, transparent 1px)`
            : `radial-gradient(circle, ${networkGlow} 0.5px, transparent 0.5px)`,
          backgroundSize: "40px 40px",
          animation: "move-bg 60s linear infinite",
        }}
      ></div>
      <style>{`@keyframes move-bg { from { background-position: 0 0; } to { background-position: 4000px 4000px; } }`}</style>

      {/* Floating Particles (Dark Mode Only) */}
      {colors.isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: accentColor,
                opacity: Math.random() * 0.5 + 0.2,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-30px) translateX(10px); }
          66% { transform: translateY(30px) translateX(-10px); }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>

      <div className="text-center z-10 p-6 max-w-5xl relative">
        {/* Social Proof Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300"
          style={{
            backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <Users className="w-4 h-4" style={{ color: accentColor }} />
          <span className={`text-sm font-semibold ${colors.text}`}>
            Join <span style={{ color: accentColor }}><AnimatedNumber endValue={liveStats.users} /></span>+ companies
          </span>
        </div>

        <h1
          className={`text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight ${colors.text}`}
          style={glowStyle}
        >
          Unlock Exponential Growth with{" "}
          <span style={{ color: accentColor }}>AI-Powered</span> Sales Insight
        </h1>
        <p
          className={`text-xl md:text-2xl mb-8 font-light ${colors.textSecondary} max-w-3xl mx-auto`}
        >
          Upload your sales data, instantly generate deep AI insights, receive
          accurate forecasts, and get{" "}
          <b className="font-semibold" style={{ color: accentColor }}>
            actionable, real-time recommendations
          </b>{" "}
          to close more deals.
        </p>

        {/* Live Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className={`px-4 py-2 rounded-lg backdrop-blur-md border ${colors.isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: accentColor }} />
              <span className={`text-sm ${colors.textSecondary}`}>Insights Generated Today:</span>
              <span className={`font-bold ${colors.text}`} style={{ color: accentColor }}>
                <AnimatedNumber endValue={liveStats.insights} />
              </span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg backdrop-blur-md border ${colors.isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: accentColor }} />
              <span className={`text-sm ${colors.textSecondary}`}>Forecast Accuracy:</span>
              <span className={`font-bold ${colors.text}`} style={{ color: accentColor }}>
                {liveStats.accuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${colors.textSecondary}`}>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${colors.textSecondary}`}>Free forever plan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={`text-sm ${colors.textSecondary}`}>Setup in 2 minutes</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <Link to="/signup">
            <Button colors={colors} className="text-lg px-8 py-4">
              Get Started Free
            </Button>
          </Link>
          <a href="#pricing">
            <Button glow variant="secondary" colors={colors} className="text-lg px-8 py-4">
              See Pricing
            </Button>
          </a>
          <button
            onClick={() => window.open('/signup', '_blank')}
            className={`flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${colors.isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
          >
            <Play className="w-5 h-5" />
            Try Interactive Demo
          </button>
        </div>

        {/* Dashboard Preview */}
        <div className="mx-auto max-w-6xl mt-16">
          <div className={`p-6 ${glassmorphismClass} transition-all duration-300`} style={{ boxShadow: colors.cardShadow }}>
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
              <div className="col-span-1 space-y-4  ">
                <div 
                  className={`p-4 rounded-xl ${innerCardBg} transition-all duration-300 cursor-pointer ${hoveredCard === 'sales' ? 'scale-105' : ''}`}
                  onMouseEnter={() => setHoveredCard('sales')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={hoveredCard === 'sales' ? {
                    boxShadow: colors.isDark ? `0 0 10px ${accentColor}40` : `0 2px 8px rgba(29, 78, 216, 0.15)`
                  } : {}}
                >
                  <p className={`text-sm uppercase ${colors.textSecondary}`}>Total Sales (YTD)</p>
                  <p className={`text-4xl font-extrabold transition-colors duration-300`} style={{ color: accentColor }}>$<AnimatedNumber endValue={245000} /></p>
                </div>
                <div 
                  className={`p-4 rounded-xl ${innerCardBg} transition-all duration-300 cursor-pointer ${hoveredCard === 'accuracy' ? 'scale-105' : ''}`}
                  onMouseEnter={() => setHoveredCard('accuracy')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={hoveredCard === 'accuracy' ? {
                    boxShadow: colors.isDark ? `0 0 10px ${accentColor}40` : `0 2px 8px rgba(29, 78, 216, 0.15)`
                  } : {}}
                >
                  <p className={`text-sm uppercase ${colors.textSecondary}`}>Forecast Accuracy</p>
                  <p className={`text-4xl font-extrabold text-cyan-500 transition-colors duration-300`}><AnimatedNumber endValue={94} />%</p>
                </div>
                <div 
                  className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${hoveredCard === 'recommendation' ? 'scale-105' : ''} ${colors.isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50/50 border-red-300'}`}
                  onMouseEnter={() => setHoveredCard('recommendation')}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={hoveredCard === 'recommendation' ? {
                    boxShadow: colors.isDark ? `0 0 12px rgba(239, 68, 68, 0.25)` : `0 2px 8px rgba(239, 68, 68, 0.15)`
                  } : {}}
                >
                  <h4 className={`text-base font-semibold flex items-center mb-2 ${colors.isDark ? 'text-red-400' : 'text-red-700'}`}>
                    <Zap className="w-4 h-4 mr-2" /> AI Recommendation
                  </h4>
                  <p className={`text-xs ${colors.textSecondary}`}>
                    Target <strong>Product B</strong> promotions this week. Insight shows 30% lower conversion due to price sensitivity.
                  </p>
                </div>
              </div>

              <div 
                className={`col-span-2 p-4 mt-2 md:mt-0 rounded-xl h-80 flex flex-col ${innerCardBg} transition-all duration-300 ${hoveredCard === 'chart' ? 'scale-[1.02]' : ''}`}
                onMouseEnter={() => setHoveredCard('chart')}
                onMouseLeave={() => setHoveredCard(null)}
                style={hoveredCard === 'chart' ? {
                  boxShadow: colors.isDark ? `0 0 15px ${accentColor}40` : `0 4px 12px rgba(29, 78, 216, 0.15)`
                } : {}}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`text-sm md:text-base font-semibold ${colors.text}`}>Monthly Revenue Trend</h4>
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
                <div className={`flex justify-center space-x-6 mb-3 text-xs ${colors.textSecondary}`}>
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
                <h4 className={`text-base font-semibold mb-4 ${colors.text}`}>Platform Health Status</h4>
                <div className="flex justify-around items-center h-20">
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
        </div>
      </div>
    </div>
  );
};


