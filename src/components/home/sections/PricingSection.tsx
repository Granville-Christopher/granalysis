import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, X, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { pricingData } from '../data';
import { featureComparison, FeatureRow } from '../../../utils/featureComparison';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const PricingSection = ({ colors }: { colors: ThemeConfig }) => {
  const navigate = useNavigate();
  const accentColor = colors.accent;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [annual, setAnnual] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const computePrices = useMemo(() => {
    return (base: number) => {
      const monthlyPrice = base;
      const annualPrice = Math.round(base * 12 * 0.85);
      return { monthlyPrice, annualPrice };
    };
  }, []);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 79, g: 163, b: 255 }; // Default blue
  };

  // Create lighter shades of accent color
  const accentRgb = hexToRgb(accentColor);
  const lightAccent1 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.25' : '0.35'})`;
  const lightAccent2 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.15' : '0.25'})`;
  const lightAccent3 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.08' : '0.15'})`;
  const lightAccentBorder = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.4' : '0.5'})`;
  const lightAccentGlow = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.25' : '0.2'})`;



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, tierTitle: string) => {
    const card = cardRefs.current[tierTitle];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (tierTitle: string) => {
    const card = cardRefs.current[tierTitle];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      className="py-24 transition-colors duration-500 border-t border-blue-300/20"
      id="pricing"
      style={{
        background: colors.isDark
          ? `linear-gradient(0deg, ${colors.bg} 0%, #1A345B 100%)`
          : `linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 50%, #F0F4F8 100%)`,
      }}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-5xl font-bold mb-4 ${colors.text}`}>
          Transparent Pricing
        </h2>
        <p className={`text-xl mb-4 ${colors.textSecondary}`}>
          Choose the plan that powers your next level of growth.
        </p>

        {/* ROI Calculator */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${colors.isDark ? 'bg-green-900/30 border border-green-500/40' : 'bg-green-100 border border-green-300'}`}>
          <TrendingUp className="w-4 h-4" style={{ color: '#22c55e', stroke: '#22c55e', '--icon-color': '#22c55e' } as React.CSSProperties} />
          <span className={`text-sm font-semibold ${colors.isDark ? 'text-green-400' : 'text-green-700'}`}>
            Average ROI: 340% in first year
          </span>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-2xl font-bold ${colors.text}`}>Feature Comparison</h3>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
              } ${colors.text}`}
            >
              {showComparison ? (
                <>
                  <ChevronUp className="w-4 h-4" style={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" style={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
                  Show Details
                </>
              )}
            </button>
          </div>

          {showComparison && (
            <div className={`rounded-lg overflow-hidden ${colors.isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-20">
                    <tr className={`${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                      <th className={`px-4 py-3 text-sm font-semibold text-left ${colors.text} sticky left-0 ${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'} z-30`}>
                        Feature
                      </th>
                      {pricingData.map((tier) => (
                        <th
                          key={tier.title}
                          className={`px-4 py-3 text-sm font-semibold text-center ${colors.text} ${
                            tier.isHighlighted ? 'border-l border-r' : ''
                          }`}
                          style={{ borderColor: tier.isHighlighted ? accentColor : 'transparent' }}
                        >
                          {tier.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      featureComparison.reduce((acc: Record<string, FeatureRow[]>, row: FeatureRow) => {
                        if (!acc[row.category]) acc[row.category] = [];
                        acc[row.category].push(row);
                        return acc;
                      }, {} as Record<string, FeatureRow[]>)
                    ).map(([category, rows]: [string, FeatureRow[]]) => (
                      <React.Fragment key={category}>
                        <tr className={`${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                          <td
                            colSpan={5}
                            className={`px-4 py-2 text-xs font-bold uppercase ${colors.textSecondary} sticky left-0 ${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'} z-20`}
                          >
                            {category}
                          </td>
                        </tr>
                        {rows.map((row: FeatureRow, idx: number) => (
                          <tr
                            key={`${category}-${idx}`}
                            className={`border-t ${colors.isDark ? 'border-white/5' : 'border-gray-100'} ${
                              colors.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'
                            } transition-colors`}
                          >
                            <td
                              className={`px-4 py-3 text-sm ${colors.textSecondary} sticky left-0 z-10`}
                              style={{ backgroundColor: colors.isDark ? '#0B1B3B' : colors.bg }}
                            >
                              {row.feature}
                            </td>
                            {['free', 'startup', 'business', 'enterprise'].map((tier) => {
                              const value = row[tier as keyof typeof row];
                              const hasFeature = value === true || (typeof value === 'string' && value !== '');
                              return (
                                <td
                                  key={tier}
                                  className={`px-4 py-3 text-center ${
                                    pricingData.find((t) => t.title.toLowerCase().includes(tier))?.isHighlighted
                                      ? colors.isDark
                                        ? 'bg-white/5'
                                        : 'bg-blue-50/50'
                                      : ''
                                  }`}
                                >
                                  {hasFeature ? (
                                    typeof value === 'string' ? (
                                      <span className={`text-xs font-medium ${colors.text}`}>{value}</span>
                                    ) : (
                                      <Check className="w-4 h-4 mx-auto" style={{ color: '#22c55e', stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.3)', '--icon-color': '#22c55e', '--icon-fill': 'rgba(34, 197, 94, 0.3)' } as React.CSSProperties} />
                                    )
                                  ) : (
                                    <X className={`w-4 h-4 mx-auto ${colors.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className={`relative inline-flex items-center justify-center mb-16 rounded-full px-2 py-2 ${colors.isDark ? 'bg-white/10' : 'bg-white/10 border border-gray-200'}`}>
          <div
            className={`absolute left-2 top-2 bottom-2 rounded-full transition-all duration-300 ease-in-out ${
              colors.isDark ? 'bg-white/20' : 'bg-gray-100'
            }`}
            style={{
              width: annual ? 'calc(60%)' : 'calc(30% )',
              transform: annual ? 'translateX(calc(60% - 4px))' : 'translateX(0)',
            }}
          />
          <button
            className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 z-10 ${
              !annual 
                ? colors.text
                : colors.textSecondary
            }`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 z-10 ${
              annual 
                ? colors.text
                : colors.textSecondary
            }`}
            onClick={() => setAnnual(true)}
          >
            Annual <span className="ml-1 save-text-green" style={{ color: '#22c55e' }}>(Save 15%)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {pricingData.map((tier, index) => {
            const { monthlyPrice, annualPrice } = computePrices(tier.price);
            
            // Premium gradient styles for each tier
            const getPremiumGradient = () => {
              if (tier.isHighlighted) {
                // Most Popular - Enhanced accent gradient
                return `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}80 50%, ${accentColor}40 100%)`;
              }
              
              // Free Tier and Business - Same look with lighter accent color
              if (tier.title === 'Free Tier' || tier.title === 'Business') {
                return `linear-gradient(135deg, ${lightAccent1} 0%, ${lightAccent2} 50%, ${lightAccent3} 100%)`;
              }
              
              // Enterprise - Gold/Amber
              return colors.isDark
                ? 'linear-gradient(135deg, rgba(255,193,7,0.3) 0%, rgba(255,152,0,0.2) 50%, rgba(255,111,0,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255,193,7,0.4) 0%, rgba(255,152,0,0.3) 50%, rgba(255,111,0,0.2) 100%)';
            };

            const getPremiumShadow = () => {
              if (tier.isHighlighted) {
                const accentGlow1 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.5' : '0.4'})`;
                const accentGlow2 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.2' : '0.15'})`;
                return colors.isDark 
                  ? `0 0 40px ${accentGlow1}, 0 0 80px ${accentGlow2}`
                  : `0 0 30px ${accentGlow1}, 0 0 60px ${accentGlow2}`;
              }
              
              // Free Tier and Business - Same look with lighter accent glow
              if (tier.title === 'Free Tier' || tier.title === 'Business') {
                return colors.isDark
                  ? `0 0 30px ${lightAccentGlow}, 0 0 60px ${lightAccent3}`
                  : `0 0 25px ${lightAccentGlow}, 0 0 50px ${lightAccent3}`;
              }
              
              // Enterprise - Gold glow
              return colors.isDark
                ? '0 0 30px rgba(255,193,7,0.3), 0 0 60px rgba(255,152,0,0.1)'
                : '0 0 25px rgba(255,193,7,0.2), 0 0 50px rgba(255,152,0,0.1)';
            };

            const getBorderColor = () => {
              if (tier.isHighlighted) return accentColor;
              
              // Free Tier and Business - Same look with lighter accent border
              if (tier.title === 'Free Tier' || tier.title === 'Business') {
                return lightAccentBorder;
              }
              
              // Enterprise - Gold border
              return colors.isDark ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.6)';
            };

            return (
              <ScrollReveal key={tier.title} className="h-full">
                <div
                  className={`p-[2px] rounded-2xl relative h-full overflow-visible`}
                  style={{
                    background: getPremiumGradient(),
                    boxShadow: tier.isHighlighted 
                      ? (colors.isDark 
                          ? `0 0 20px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)` 
                          : `0 0 15px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.2)`)
                      : 'none',
                  }}
                >
                  {tier.isHighlighted && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full z-10 shadow-lg animate-pulse"
                      style={{
                        backgroundColor: accentColor,
                        color: colors.isDark ? "#0B1B3B" : "white",
                        boxShadow: `0 0 20px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.5)`,
                      }}
                    >
                      Most Popular
                    </span>
                  )}
                  <div
                    ref={(el) => {
                      cardRefs.current[tier.title] = el;
                    }}
                    onMouseMove={(e) => handleMouseMove(e, tier.title)}
                    onMouseEnter={(e) => {
                      const card = e.currentTarget;
                      card.style.boxShadow = getPremiumShadow();
                    }}
                    onMouseLeave={(e) => {
                      handleMouseLeave(tier.title);
                      const card = e.currentTarget;
                      card.style.boxShadow = `0 4px 20px rgba(0,0,0,${colors.isDark ? '0.3' : '0.1'})`;
                    }}
                    className={`p-8 flex flex-col h-full ${glassmorphismClass} transition-all duration-300`}
                    style={{
                      borderColor: getBorderColor(),
                      borderWidth: '1px',
                      transformStyle: "preserve-3d",
                      transition: "transform 0.1s ease-out, box-shadow 0.3s ease-out",
                      boxShadow: `0 4px 20px rgba(0,0,0,${colors.isDark ? '0.3' : '0.1'})`,
                    }}
                  >
                    <h3 className={`md:text-3xl text-xl font-bold mb-2 ${colors.text}`}>
                      {tier.title}
                    </h3>

                    <p className={`${colors.textSecondary} mb-6 text-sm md:text-base`}>
                      {tier.description}
                    </p>

                    {(tier.title === 'Business' || tier.title === 'Enterprise') && (
                      <div
                        className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: colors.isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.12)',
                          border: `1px solid ${colors.isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)'}`,
                          color: colors.isDark ? '#cbd5e1' : '#1f2937'
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: colors.accent }}></span>
                        AI Chat Assistant Included
                      </div>
                    )}

                    <div className="my-6">
                      <div className="flex flex-col items-center">
                        {tier.price > 0 && !annual && (
                          <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse">
                            50% OFF First Month
                          </div>
                        )}
                        {tier.price > 0 && annual && (
                          <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500">
                            Save 15% Yearly
                          </div>
                        )}
                        <div className="flex items-baseline font-semibold">
                          <span
                            className={`md:text-5xl text-2xl font-semibold ${colors.text}`}
                          >
                            $
                          </span>
                          <span
                            className={`md:text-7xl text-5xl font-semibold ${colors.text}`}
                          >
                            <AnimatedNumber
                              key={annual ? "annual" : "monthly"}
                              endValue={annual ? annualPrice : (tier.price > 0 && !annual ? Math.round(monthlyPrice * 0.5) : monthlyPrice)}
                            />
                          </span>
                          <span
                            className={`md:text-2xl text-sm font-semibold ${colors.textSecondary} ml-1`}
                          >
                            {annual ? "/yr" : "/mo"}
                          </span>
                        </div>

                        <div
                          className={`flex items-center mt-1 ${colors.textSecondary}`}
                        >
                          {annual ? (
                            <>
                              <span className="md:text-sm text-xs line-through opacity-60">
                                ${(monthlyPrice * 12).toLocaleString()}
                              </span>
                              <span className="md:text-xs text-xs ml-1">/yr</span>
                            </>
                          ) : (
                            <>
                              {tier.price > 0 && (
                                <>
                                  <span className="md:text-sm text-xs line-through opacity-60">
                                    ${monthlyPrice.toLocaleString()}
                                  </span>
                                  <span className="md:text-xs text-xs ml-1 opacity-70">
                                    /mo (first month only)
                                  </span>
                                </>
                              )}
                              {tier.price === 0 && (
                                <>
                                  <span className="md:text-sm text-xs opacity-70">
                                    ${(annualPrice / 12).toLocaleString()}
                                  </span>
                                  <span className="md:text-xs text-xs ml-1">
                                    /mo (annual equivalent)
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow mb-8 space-y-3">
                      {tier.features.map((feature, i) => (
                        <div
                          key={i}
                          className={`flex items-center ${colors.textSecondary}`}
                        >
                          <Zap
                            className={`md:w-4 w-3 md:h-4 h-3 md:mr-3 mr-2 text-xs md:text-base`}
                            style={{
                              color: tier.isHighlighted
                                ? accentColor
                                : '#22c55e',
                              stroke: tier.isHighlighted
                                ? accentColor
                                : '#22c55e',
                              fill: tier.isHighlighted
                                ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)`
                                : 'rgba(34, 197, 94, 0.3)',
                              '--icon-color': tier.isHighlighted ? accentColor : '#22c55e',
                              '--icon-fill': tier.isHighlighted
                                ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)`
                                : 'rgba(34, 197, 94, 0.3)',
                            } as React.CSSProperties}
                          />
                          <span className="md:text-sm text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`mt-auto border`}
                      colors={colors}
                      gradientHover={!colors.isDark}
                      onClick={(e) => {
                        if (e) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                        if (tier.title === 'Free Tier') return;
                        const tierMap: Record<string, string> = {
                          'Startup': 'startup',
                          'Business': 'business',
                          'Enterprise': 'enterprise',
                        };
                        const tierKey = tierMap[tier.title] || 'startup';
                        navigate(`/payment?tier=${tierKey}&annual=${annual}`);
                      }}
                    >
                      {tier.isHighlighted ? "Start Free Trial" : "Choose Plan"}
                    </Button>
                    {tier.title === "Enterprise" && (
                      <button
                        className={`mt-2 text-sm ${colors.textSecondary} hover:${colors.text} transition-colors`}
                      >
                        Contact Sales →
                      </button>
                    )}
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

