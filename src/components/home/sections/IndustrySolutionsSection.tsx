import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, ShieldCheck, Users, X, Tag, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { detailedUseCases, caseStudies } from '../data';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';

export const IndustrySolutionsSection = ({ colors }: { colors: ThemeConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCaseStudiesModalOpen, setIsCaseStudiesModalOpen] = useState(false);
  const solutions = [
    { title: 'E-commerce & Retail', useCase: 'Inventory Forecasting', benefit: 'Reduce **stockouts by 15%** and optimize warehouse logistics.', icon: DollarSign, color: 'text-red-500' },
    { title: 'SaaS & Subscriptions', useCase: 'Churn Prevention', benefit: 'Identify **90% of at-risk customers** 30 days in advance.', icon: Users, color: 'text-purple-500' },
    { title: 'B2B & Enterprise', useCase: 'Territory Optimization', benefit: 'Maximize sales pipeline value based on **predictive scoring**.', icon: BarChart3, color: 'text-yellow-500' },
    { title: 'Financial Services', useCase: 'Compliance & Audit', benefit: 'Automate data lineage and **audit-trail generation** for regulatory needs.', icon: ShieldCheck, color: 'text-green-500' },
  ];
  const glassmorphismClass = getGlassmorphismClass(colors);

  return (
    <div className="py-24 transition-colors duration-500" id="solutions" style={{ backgroundColor: colors.secondaryBg }}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-5xl font-bold mb-4 ${colors.text}`}>Solutions for Your Industry</h2>
        <p className={`text-xl mb-16 ${colors.textSecondary}`}>Stop analyzing general data. Start solving *your* specific challenges.</p>

        {/* Industry Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <button className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text}`}>
            All Industries
          </button>
          {solutions.map((s, idx) => (
            <button key={idx} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${colors.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} ${colors.textSecondary}`}>
              {s.title.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((s, index) => {
            const roiMetrics = [
              { label: 'ROI', value: '340%', color: 'text-green-500' },
              { label: 'Time Saved', value: '95%', color: 'text-blue-500' },
              { label: 'Accuracy', value: '94%', color: 'text-purple-500' }
            ];
            
            return (
              <ScrollReveal key={index} className="h-full">
                <div className={`p-6 flex flex-col items-start h-full text-left ${glassmorphismClass} hover:shadow-[0_0_25px_rgba(79,163,255,0.4)] transition-all duration-300 group cursor-pointer`}>
                  <div className="flex items-center justify-between w-full mb-4">
                    <s.icon className={`w-8 h-8 ${s.color} transition-transform duration-300 group-hover:scale-110`} />
                    <a 
                      href="#case-studies" 
                      className={`text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}
                      style={{ color: colors.accent }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to case studies
                      }}
                    >
                      Case Study →
                    </a>
                  </div>
                  <h3 className={`text-xl font-bold mb-2`} style={{ color: colors.accent }}>{s.title}</h3>
                  <p className={`text-2xl font-semibold mb-4 ${colors.text}`}>{s.useCase}</p>
                  <p className={`text-sm mb-4 ${colors.textSecondary}`}>{s.benefit}</p>
                  
                  {/* ROI Metrics */}
                  <div className="mt-auto pt-4 border-t w-full" style={{ borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {roiMetrics.map((metric, i) => (
                        <div key={i}>
                          <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                          <div className={`text-xs ${colors.textSecondary}`}>{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button 
            onClick={() => setIsModalOpen(true)}
            glow={false} 
            variant="secondary" 
            colors={colors}
            className="font-semibold"
          >
            View Detailed Use Cases
          </Button>
          <Button 
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();
              e?.stopPropagation();
              setIsCaseStudiesModalOpen(true);
            }}
            colors={colors}
            className="font-semibold"
          >
            View Case Studies
          </Button>
        </div>
      </div>
      <DetailedUseCasesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        colors={colors}
      />
      <CaseStudiesModal 
        isOpen={isCaseStudiesModalOpen}
        onClose={() => setIsCaseStudiesModalOpen(false)}
        colors={colors}
      />
    </div>
  );
};

export const DetailedUseCasesModal = ({ isOpen, onClose, colors }: { isOpen: boolean, onClose: () => void, colors: ThemeConfig }) => {
  const accentColor = colors.accent;
  const modalGlassClass = getGlassmorphismClass(colors);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300"
      style={{
        backgroundColor: colors.isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-6xl max-h-[92vh] overflow-y-auto relative rounded-2xl ${modalGlassClass} transition-all duration-300 transform`}
        style={{
          boxShadow: colors.isDark 
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(79, 163, 255, 0.15), 0 0 80px rgba(79, 163, 255, 0.15)` 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          animation: 'modalSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .modal-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .modal-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px 0;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: ${accentColor};
            border-radius: 2px;
            opacity: 0.4;
            transition: opacity 0.2s ease;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            opacity: 0.8;
          }
          .modal-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${accentColor}40 transparent;
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 p-6 pb-4 border-b backdrop-blur-xl"
          style={{
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-3xl md:text-4xl font-extrabold mb-2`} style={{ color: accentColor }}>
                Detailed AI Use Cases
              </h2>
              <p className={`text-sm md:text-base ${colors.textSecondary} max-w-2xl`}>
                Granalysis moves beyond basic reporting to deliver specific, tactical advantages tailored to your business model and industry challenges.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`ml-4 p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              style={{ color: colors.text }}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 modal-scrollbar">
          <div className="space-y-16">
            {detailedUseCases.map((industryGroup, groupIndex) => (
              <div key={groupIndex} className="scroll-reveal-section">
                {/* Industry Header */}
                <div className="flex items-center gap-4 mb-8 pb-4 border-b"
                  style={{ borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                >
                  <div className={`p-3 rounded-xl ${colors.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <industryGroup.icon className={`w-8 h-8 ${industryGroup.color}`} />
                  </div>
                  <h3 className={`text-2xl md:text-3xl font-bold ${colors.text}`}>
                    {industryGroup.industry}
                  </h3>
                </div>

                {/* Use Case Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {industryGroup.details.map((detail, detailIndex) => (
                    <div 
                      key={detailIndex} 
                      className={`group p-6 rounded-xl transition-all duration-300 cursor-default border relative overflow-hidden`}
                      style={{
                        backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
                        borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        boxShadow: colors.isDark 
                          ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = colors.isDark
                          ? `0 10px 25px -5px rgba(79, 163, 255, 0.3), 0 0 0 1px ${accentColor}40`
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = colors.isDark 
                          ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      {/* Accent Border */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                        style={{ 
                          backgroundColor: accentColor,
                          width: '4px',
                        }}
                      />
                      
                      <div className="pl-2">
                        <h4 className={`text-xl md:text-2xl font-bold mb-3 ${colors.text} group-hover:opacity-90 transition-opacity`}>
                          {detail.title}
                        </h4>
                        <p className={`text-sm md:text-base mb-5 leading-relaxed ${colors.textSecondary}`}>
                          {detail.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {detail.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                              style={{
                                backgroundColor: colors.isDark 
                                  ? 'rgba(79, 163, 255, 0.15)' 
                                  : 'rgba(29, 78, 216, 0.1)',
                                color: accentColor,
                                border: `1px solid ${accentColor}40`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.isDark 
                                  ? 'rgba(79, 163, 255, 0.25)' 
                                  : 'rgba(29, 78, 216, 0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = colors.isDark 
                                  ? 'rgba(79, 163, 255, 0.15)' 
                                  : 'rgba(29, 78, 216, 0.1)';
                              }}
                            >
                              <Tag className="w-3 h-3 mr-1.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 pt-8 border-t text-center"
            style={{ borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          >
            <Button 
              onClick={onClose} 
              colors={colors}
              className="px-8 py-3 text-base font-semibold"
            >
              Explore Pricing Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CaseStudiesModal = ({ isOpen, onClose, colors }: { isOpen: boolean, onClose: () => void, colors: ThemeConfig }) => {
  const accentColor = colors.accent;
  const modalGlassClass = getGlassmorphismClass(colors);
  const [selectedCase, setSelectedCase] = useState<typeof caseStudies[0] | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSelectedCase(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300"
      style={{
        backgroundColor: colors.isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-6xl max-h-[92vh] overflow-y-auto relative rounded-2xl ${modalGlassClass} transition-all duration-300 transform`}
        style={{
          boxShadow: colors.isDark 
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(79, 163, 255, 0.15), 0 0 80px rgba(79, 163, 255, 0.15)` 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.1)',
          animation: 'modalSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .case-studies-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .case-studies-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px 0;
          }
          .case-studies-scrollbar::-webkit-scrollbar-thumb {
            background: ${accentColor};
            border-radius: 2px;
            opacity: 0.4;
            transition: opacity 0.2s ease;
          }
          .case-studies-scrollbar::-webkit-scrollbar-thumb:hover {
            opacity: 0.8;
          }
          .case-studies-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${accentColor}40 transparent;
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 p-6 pb-4 border-b backdrop-blur-xl"
          style={{
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-3xl md:text-4xl font-extrabold mb-2`} style={{ color: accentColor }}>
                Success Stories & Case Studies
              </h2>
              <p className={`text-sm md:text-base ${colors.textSecondary} max-w-2xl`}>
                Real results from companies transforming their operations with Granalysis AI.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`ml-4 p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              style={{ color: colors.text }}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 case-studies-scrollbar">
          {!selectedCase ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudies.map((caseStudy) => (
                <div
                  key={caseStudy.id}
                  className={`group p-6 rounded-xl transition-all duration-300 cursor-pointer border relative overflow-hidden`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    boxShadow: colors.isDark 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = colors.isDark
                      ? `0 10px 25px -5px rgba(79, 163, 255, 0.3), 0 0 0 1px ${accentColor}40`
                      : '0 10px 25px -5px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = colors.isDark 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => setSelectedCase(caseStudy)}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                    style={{ backgroundColor: accentColor, width: '4px' }}
                  />
                  
                  <div className="pl-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-transform duration-300 group-hover:scale-110`}
                        style={{ 
                          backgroundColor: accentColor,
                          color: colors.isDark ? '#0B1B3B' : 'white'
                        }}
                      >
                        {caseStudy.logo}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${colors.text}`}>{caseStudy.company}</h3>
                        <p className={`text-sm ${colors.textSecondary}`}>{caseStudy.industry}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4" style={{ color: accentColor }} />
                      <span className={`text-xs ${colors.textSecondary}`}>Implementation: {caseStudy.duration}</span>
                    </div>

                    <p className={`text-sm mb-4 line-clamp-3 ${colors.textSecondary}`}>
                      {caseStudy.challenge}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accentColor }}>
                      <span>View Details</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedCase(null)}
                className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                style={{ color: colors.isDark ? '#ffffff' : colors.text }}
              >
                <X className="w-4 h-4" />
                Back to All Case Studies
              </button>

              <div className={`p-8 rounded-xl border`}
                style={{
                  backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b"
                  style={{ borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl`}
                    style={{ 
                      backgroundColor: accentColor,
                      color: colors.isDark ? '#0B1B3B' : 'white'
                    }}
                  >
                    {selectedCase.logo}
                  </div>
                  <div>
                    <h3 className={`text-3xl font-bold mb-1 ${colors.text}`}>{selectedCase.company}</h3>
                    <p className={`text-base ${colors.textSecondary}`}>{selectedCase.industry}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4" style={{ color: accentColor }} />
                      <span className={`text-sm ${colors.textSecondary}`}>{selectedCase.duration} implementation</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${colors.text}`}>
                      <Tag className="w-5 h-5" style={{ color: accentColor }} />
                      The Challenge
                    </h4>
                    <p className={`text-base leading-relaxed ${colors.textSecondary}`}>{selectedCase.challenge}</p>
                  </div>

                  <div>
                    <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${colors.text}`}>
                      <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
                      The Solution
                    </h4>
                    <p className={`text-base leading-relaxed ${colors.textSecondary}`}>{selectedCase.solution}</p>
                  </div>

                  <div>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${colors.text}`}>
                      <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
                      Results
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedCase.results.map((result, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border`}
                          style={{
                            backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.1)' : 'rgba(29, 78, 216, 0.05)',
                            borderColor: colors.isDark ? 'rgba(79, 163, 255, 0.2)' : 'rgba(29, 78, 216, 0.2)',
                          }}
                        >
                          <div className={`text-3xl font-extrabold mb-1`} style={{ color: accentColor }}>
                            {result.value}
                          </div>
                          <div className={`text-sm font-semibold mb-2 ${colors.text}`}>{result.metric}</div>
                          <div className={`text-xs ${colors.textSecondary}`}>{result.improvement}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-6 rounded-lg border-l-4`}
                    style={{
                      backgroundColor: colors.isDark ? 'rgba(79, 163, 255, 0.05)' : 'rgba(29, 78, 216, 0.05)',
                      borderLeftColor: accentColor,
                    }}
                  >
                    <p className={`text-base italic mb-4 ${colors.text}`}>"{selectedCase.testimonial.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold`}
                        style={{ 
                          backgroundColor: accentColor,
                          color: colors.isDark ? '#0B1B3B' : 'white'
                        }}
                      >
                        {selectedCase.testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className={`font-semibold ${colors.text}`}>{selectedCase.testimonial.author}</div>
                        <div className={`text-sm ${colors.textSecondary}`}>{selectedCase.testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedCase && (
            <div className="mt-12 pt-8 border-t text-center"
              style={{ borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
            >
              <Button 
                onClick={onClose} 
                colors={colors}
                className="px-8 py-3 text-base font-semibold"
              >
                Explore Pricing Plans
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


