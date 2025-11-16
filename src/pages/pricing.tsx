import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../components/home/theme';
import { pricingData } from '../components/home/data';
import { featureComparison, FeatureRow } from '../utils/featureComparison';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/home/ui/Button';

const PricingPage: React.FC = () => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(true);
  const [showComparison, setShowComparison] = useState(true);
  const accentColor = colors.accent;
  const glassmorphismClass = getGlassmorphismClass(colors);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 79, g: 163, b: 255 };
  };

  const accentRgb = hexToRgb(accentColor);
  const lightAccent1 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.25' : '0.35'})`;
  const lightAccent2 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.15' : '0.25'})`;
  const lightAccent3 = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.08' : '0.15'})`;
  const lightAccentBorder = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${colors.isDark ? '0.4' : '0.5'})`;

  const computePrices = useMemo(() => {
    return (base: number) => {
      const monthlyPrice = base;
      const annualPrice = Math.round(base * 12 * 0.85);
      return { monthlyPrice, annualPrice };
    };
  }, []);

  const handleUpgrade = (tierTitle: string) => {
    // Navigate to payment page with tier information
    const tierMap: Record<string, string> = {
      'Free Tier': 'free',
      'Startup': 'startup',
      'Business': 'business',
      'Enterprise': 'enterprise',
    };
    const tierKey = tierMap[tierTitle] || 'startup';
    navigate(`/payment?tier=${tierKey}&annual=${annual}`);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${colors.isDark ? 'bg-[#0B1B3B]' : 'bg-[#F9FAFB]'}`}
      style={{
        background: colors.isDark
          ? `linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)`
          : `linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 50%, #F9FAFB 100%)`,
      }}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.3)' : 'rgba(29, 78, 216, 0.2)',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${colors.text}`}>
            Choose Your Plan
          </h1>
          <p className={`text-xl ${colors.textSecondary} mb-8`}>
            Select the perfect plan for your data analysis needs
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`${colors.textSecondary} ${!annual ? colors.text : ''}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                annual ? accentColor : colors.isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${
                  annual ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`${colors.textSecondary} ${annual ? colors.text : ''}`}>
              Annual <span className="text-green-500">(Save 15%)</span>
            </span>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${colors.text}`}>Feature Comparison</h2>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
              } ${colors.text}`}
            >
              {showComparison ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Details
                </>
              )}
            </button>
          </div>

          {showComparison && (
            <div className={`rounded-lg overflow-hidden ${colors.isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                      <th className={`px-4 py-3 text-sm font-semibold text-left ${colors.text} sticky left-0 ${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'} z-10`}>
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
                            className={`px-4 py-2 text-xs font-bold uppercase ${colors.textSecondary} sticky left-0 ${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'} z-10`}
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
                              className={`px-4 py-3 text-sm ${colors.textSecondary} sticky left-0 ${colors.isDark ? 'bg-[#0B1B3B]' : 'bg-white'} z-10`}
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
                                      <Check className="w-4 h-4 mx-auto text-green-500" />
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingData.map((tier, index) => {
            const { monthlyPrice, annualPrice } = computePrices(tier.price);
            const displayPrice = annual ? annualPrice : monthlyPrice;
            const pricePeriod = annual ? '/year' : '/month';

            const getPremiumGradient = () => {
              if (tier.isHighlighted) {
                return `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}80 50%, ${accentColor}40 100%)`;
              }
              if (tier.title === 'Free Tier' || tier.title === 'Business') {
                return `linear-gradient(135deg, ${lightAccent1} 0%, ${lightAccent2} 50%, ${lightAccent3} 100%)`;
              }
              return colors.isDark
                ? 'linear-gradient(135deg, rgba(255,193,7,0.3) 0%, rgba(255,152,0,0.2) 50%, rgba(255,111,0,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255,193,7,0.4) 0%, rgba(255,152,0,0.3) 50%, rgba(255,111,0,0.2) 100%)';
            };

            return (
              <div
                key={index}
                className={`${glassmorphismClass} p-8 flex flex-col transition-all duration-300 hover:scale-105 ${
                  tier.isHighlighted ? 'ring-2 ring-offset-4' : ''
                }`}
                style={{
                  background: tier.isHighlighted
                    ? `linear-gradient(135deg, ${colors.isDark ? 'rgba(79, 163, 255, 0.15)' : 'rgba(79, 163, 255, 0.1)'} 0%, ${colors.glassBg} 100%)`
                    : undefined,
                  borderColor: tier.isHighlighted ? accentColor : undefined,
                  boxShadow: tier.isHighlighted
                    ? `0 0 30px ${accentColor}40, ${colors.cardShadow}`
                    : colors.cardShadow,
                }}
              >
                {tier.isHighlighted && (
                  <div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white"
                    style={{ background: getPremiumGradient() }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  {tier.price > 0 && !annual && (
                    <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse inline-block">
                      50% OFF First Month
                    </div>
                  )}
                  {tier.price > 0 && annual && (
                    <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 inline-block">
                      Save 15% Yearly
                    </div>
                  )}
                  <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>{tier.title}</h3>
                  <p className={`text-sm ${colors.textSecondary} mb-4`}>{tier.description}</p>
                  {(tier.title === 'Business' || tier.title === 'Enterprise') && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: colors.isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.12)',
                        border: `1px solid ${colors.isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)'}`,
                        color: colors.isDark ? '#cbd5e1' : '#1f2937'
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: accentColor }}></span>
                      AI Chat Assistant Included
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${colors.text}`}>
                      ${annual && tier.price > 0 ? Math.round(tier.price * 12 * 0.85) : (tier.price > 0 && !annual ? Math.round(tier.price * 0.5) : tier.price)}
                    </span>
                    {tier.price > 0 && (
                      <span className={`text-lg ${colors.textSecondary}`}>{pricePeriod}</span>
                    )}
                  </div>
                  {annual && tier.price > 0 && (
                    <p className={`text-xs ${colors.textSecondary} mt-1`}>
                      ${tier.price}/month billed annually
                    </p>
                  )}
                  {!annual && tier.price > 0 && (
                    <p className={`text-xs ${colors.textSecondary} mt-1`}>
                      <span className="line-through opacity-60">${tier.price}</span> ${Math.round(tier.price * 0.5)} first month only
                    </p>
                  )}
                </div>

                <div className="flex-grow mb-8 space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className={`flex items-center ${colors.textSecondary}`}>
                      <Zap
                        className={`w-4 h-4 mr-3 ${
                          tier.isHighlighted ? '' : 'text-green-500'
                        }`}
                        style={{
                          color: tier.isHighlighted ? accentColor : undefined,
                        }}
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-auto border w-full"
                  colors={colors}
                  gradientHover={!colors.isDark}
                  onClick={(e) => {
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    handleUpgrade(tier.title);
                  }}
                >
                  {tier.title === 'Free Tier' ? 'Current Plan' : tier.isHighlighted ? 'Start Free Trial' : 'Choose Plan'}
                </Button>
                {tier.title === 'Enterprise' && (
                  <button
                    className={`mt-2 text-sm ${colors.textSecondary} hover:${colors.text} transition-colors text-center w-full`}
                    onClick={() => alert('Contact sales for Enterprise pricing')}
                  >
                    Contact Sales →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-6 py-3 rounded-xl ${colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} ${colors.text} transition-colors`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

