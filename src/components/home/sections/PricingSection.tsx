import React, { useMemo, useState, useRef } from 'react';
import { Zap, Check, X, TrendingUp } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { pricingData } from '../data';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const PricingSection = ({ colors }: { colors: ThemeConfig }) => {
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


  const allFeatures = ['1 file upload/month', 'Max 100 rows per file', 'Basic insights only', 'Email support', 'Up to 5 uploads/month', 'Up to 500 rows per file', 'Full AI insights & reports', 'Sales forecasting', 'Priority support', 'Up to 15 uploads/month', 'Up to 1000 rows per file', 'Advanced insights & modeling', 'Team dashboards & sharing', 'Dedicated account manager', 'Unlimited uploads', 'Unlimited rows per file', 'Unlimited DB linking (SQL, NoSQL)', 'All features included', '24/7 Premium Support'];

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
          : `linear-gradient(270deg, ${colors.bg} 0%, #E5E7EB 100%)`,
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
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className={`text-sm font-semibold ${colors.isDark ? 'text-green-400' : 'text-green-700'}`}>
            Average ROI: 340% in first year
          </span>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text}`}
          >
            {showComparison ? 'Hide' : 'Show'} Comparison Table
          </button>
        </div>

        {/* Comparison Table */}
        {showComparison && (
          <div className={`mb-12 rounded-lg overflow-hidden ${colors.isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${colors.isDark ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                    <th className={`px-4 py-3 text-sm font-semibold text-left ${colors.text}`}>Feature</th>
                    {pricingData.map((tier) => (
                      <th key={tier.title} className={`px-4 py-3 text-sm font-semibold text-center ${colors.text} ${tier.isHighlighted ? 'border-l border-r' : ''}`} style={{ borderColor: tier.isHighlighted ? accentColor : 'transparent' }}>
                        {tier.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, idx) => (
                    <tr key={idx} className={`border-t ${colors.isDark ? 'border-white/5' : 'border-gray-100'} ${colors.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'} transition-colors`}>
                      <td className={`px-4 py-3 text-sm ${colors.textSecondary}`}>{feature}</td>
                      {pricingData.map((tier) => {
                        const hasFeature = tier.features.includes(feature);
                        return (
                          <td key={tier.title} className={`px-4 py-3 text-center ${tier.isHighlighted ? (colors.isDark ? 'bg-white/5' : 'bg-blue-50/50') : ''}`}>
                            {hasFeature ? (
                              <Check className="w-4 h-4 mx-auto text-green-500" />
                            ) : (
                              <X className={`w-4 h-4 mx-auto ${colors.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                ? (colors.isDark ? 'text-white' : 'text-gray-900') 
                : (colors.isDark ? 'text-gray-400' : 'text-gray-500')
            }`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 z-10 ${
              annual 
                ? (colors.isDark ? 'text-white' : 'text-gray-900') 
                : (colors.isDark ? 'text-gray-400' : 'text-gray-500')
            }`}
            onClick={() => setAnnual(true)}
          >
            Annual <span className="ml-1 text-green-500">(Save 15%)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {pricingData.map((tier) => {
            const { monthlyPrice, annualPrice } = computePrices(tier.price);
            
            // const mainPrice = annual ? annualPrice : monthlyPrice;

            return (
              <ScrollReveal key={tier.title} className="h-full">
                <div
                  className={`p-[2px] rounded-2xl relative h-full ${
                    tier.isHighlighted ? "" : ""
                  }`}
                  style={{
                    background: tier.isHighlighted
                      ? `linear-gradient(135deg, ${accentColor}, transparent)`
                      : colors.isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  }}
                >
                  {tier.isHighlighted && (
                    <span
                      className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full z-10 shadow-lg"
                      style={{
                        backgroundColor: accentColor,
                        color: colors.isDark ? "#0B1B3B" : "white",
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
                    onMouseLeave={() => handleMouseLeave(tier.title)}
                    className={`p-8 flex flex-col h-full ${glassmorphismClass} ${
                      colors.isDark
                        ? "hover:shadow-[0_0_30px_rgba(79,163,255,0.4)]"
                        : "hover:shadow-xl"
                    }`}
                    style={{
                      borderColor: tier.isHighlighted ? accentColor : undefined,
                      transformStyle: "preserve-3d",
                      transition: "transform 0.1s ease-out",
                    }}
                  >
                    <h3 className={`md:text-3xl text-xl font-bold mb-2 ${colors.text}`}>
                      {tier.title}
                    </h3>

                    <p className={`${colors.textSecondary} mb-6 text-sm md:text-base`}>
                      {tier.description}
                    </p>

                    <div className="my-6">
                      <div className="flex flex-col items-center">
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
                              endValue={annual ? annualPrice : monthlyPrice}
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
                              <span className="md:text-sm text-xs opacity-70">
                                ${(annualPrice / 12).toLocaleString()}
                              </span>
                              <span className="md:text-xs text-xs ml-1">
                                /mo (annual equivalent)
                              </span>
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
                            className={`md:w-4 w-3 md:h-4 h-3 md:mr-3 mr-2 text-xs md:text-base ${
                              tier.isHighlighted ? "" : "text-green-500"
                            }`}
                            style={{
                              color: tier.isHighlighted
                                ? accentColor
                                : undefined,
                            }}
                          />
                          <span className="md:text-sm text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`mt-auto border`}
                      colors={colors}
                      gradientHover={!colors.isDark}
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


