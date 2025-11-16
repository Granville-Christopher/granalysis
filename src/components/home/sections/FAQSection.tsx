import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, Mail } from 'lucide-react';
import { ThemeConfig } from '../theme';
import { faqData } from '../data';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';

export const FAQSection = ({ colors }: { colors: ThemeConfig }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const accentColor = colors.accent;

  const toggleQuestion = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return faqData;
    const query = searchQuery.toLowerCase();
    return faqData.filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const faqDarkGlassClass = 'backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 bg-white/[0.02] border-white/10 border';
  const faqLightGlassClass = 'backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 bg-white/80 border border-gray-200';

  return (
    <div className="py-24 transition-colors duration-500" id="faq" style={{ background: colors.isDark ? colors.secondaryBg : `linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)` }}>
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className={`md:text-5xl text-3xl font-bold text-center mb-4 ${colors.text}`}>You Ask. Granalysis Answers.</h2>
        <p className={`md:text-xl text-base text-center mb-8 ${colors.textSecondary}`}>Clear answers that articulate our core value proposition.</p>

        {/* Search Bar */}
        <div className="mb-12 relative max-w-2xl mx-auto">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${colors.textSecondary}`} />
          <input
            type="text"
            placeholder="Search frequently asked questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.isDark ? 'bg-white/5 border-white/10 placeholder-gray-400' : 'bg-white border-gray-200 placeholder-gray-500'} ${colors.text}`}
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties & { '--tw-ring-color'?: string }}
          />
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className={`md:text-lg text-base ${colors.textSecondary} mb-4`}>No questions found matching your search.</p>
            <Button 
              colors={colors} 
              variant="secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {filteredFAQs.map((item, originalIndex) => {
            const index = faqData.indexOf(item);
            const isOpen = activeIndex === index;
            const faqInnerClass = colors.isDark ? faqDarkGlassClass : faqLightGlassClass;

            return (
              <ScrollReveal key={index}>
                <div className={`p-px rounded-xl transition-all duration-500`}
                  style={{
                    background: isOpen
                      ? `linear-gradient(90deg, ${accentColor}, ${colors.bg})`
                      : 'transparent'
                  }}
                >
                  <div className={`p-6 ${faqInnerClass} border-none card-hover`}>
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg p-2 -m-2"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties & { '--tw-ring-color'?: string }}
                    >
                      <span className={`md:text-xl text-lg font-semibold hover:opacity-80 transition-all duration-300 ${colors.text} ${isOpen ? 'text-[var(--tw-ring-color)]' : ''}`} style={{ '--tw-ring-color': accentColor } as React.CSSProperties & { '--tw-ring-color'?: string }}>
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 ml-4 transition-all duration-300 ${isOpen ? 'rotate-180 scale-110' : 'rotate-0'}`}
                        style={{ color: accentColor }}
                      />
                    </button>

                    <div
                      id={`faq-answer-${index}`}
                      className={`overflow-hidden transition-all duration-500 ease-in-out`}
                      role="region"
                      aria-hidden={!isOpen}
                      style={{
                        maxHeight: isOpen ? '500px' : '0',
                        opacity: isOpen ? 1 : 0,
                        marginTop: isOpen ? '1rem' : '0',
                      }}
                    >
                      <p className={`pt-4 ${colors.text} border-t ${colors.isDark ? 'border-white/10' : 'border-gray-300'} mt-4 md:text-lg text-base animate-fade-in`}>
                        <span dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${colors.isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
            <Mail className="w-5 h-5" style={{ color: accentColor }} />
            <span className={`${colors.textSecondary}`}>Still have questions?</span>
            <Button 
              colors={colors} 
              variant="secondary"
              onClick={() => window.location.href = 'mailto:support@granalysis.com'}
              className="ml-2"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
