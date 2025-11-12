import React, { useEffect, useState } from 'react';
import { ThemeConfig } from '../theme';
import { testimonials } from '../data';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const TestimonialsSection = ({ colors }: { colors: ThemeConfig }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const accentColor = colors.accent;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="py-24 transition-colors duration-500" style={{ backgroundColor: colors.bg }}>
      <div className="container mx-auto px-6">
        <h2 className={`text-3xl md:text-5xl font-bold text-center mb-4 ${colors.text}`}>What Our Leaders Say</h2>
        <p className={`md:text-xl text-base text-center mb-12 ${colors.textSecondary}`}>Real feedback from real customers</p>

        <ScrollReveal>
          <div className={`md:p-8 p-4 mx-auto max-w-4xl min-h-[300px] relative overflow-hidden ${colors.isDark ? 'bg-white/[0.02] border border-white/10 rounded-2xl' : 'bg-white/80 border border-gray-200 rounded-2xl'}`}>
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className={`w-5 h-5 ${colors.text}`} />
            </button>
            <button
              onClick={nextTestimonial}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Next testimonial"
            >
              <ChevronRight className={`w-5 h-5 ${colors.text}`} />
            </button>

            <div className="flex items-center min-h-[300px]">
              <div
                className="flex transition-transform duration-700 w-full"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((t, index) => (
                  <div key={index} className="min-w-full flex items-center gap-8 p-4">
                    {/* Avatar/Logo Placeholder */}
                    <div className="hidden md:flex flex-col items-center">
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center md:text-2xl text-lg font-bold mb-2 transition-transform duration-300 hover:scale-110"
                        style={{ 
                          backgroundColor: accentColor,
                          color: colors.isDark ? '#0B1B3B' : 'white'
                        }}
                      >
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <p className={`md:text-2xl text-lg font-serif italic mb-6 leading-relaxed ${colors.text}`}>"{t.quote}"</p>
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                        <p className={`text-lg font-semibold ${colors.text}`}>{t.name}</p>
                        <span className="hidden md:inline">•</span>
                        <p className={`text-sm`} style={{ color: accentColor }}>{t.title}</p>
                      </div>
                      {/* Company Logo Placeholder */}
                      <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
                        <div className={`px-3 py-1 rounded text-xs font-semibold ${colors.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                          {t.title.split(',')[1]?.trim() || 'Enterprise Client'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'w-8' : 'w-2'} ${colors.isDark ? index === currentTestimonial ? '' : 'bg-gray-600' : index === currentTestimonial ? '' : 'bg-gray-400'}`}
                  style={{ backgroundColor: index === currentTestimonial ? accentColor : undefined }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="text-center mt-12">
          <Button 
            colors={colors}
            variant="secondary"
            onClick={() => window.location.href = '#reviews'}
            className="inline-flex items-center gap-2"
          >
            <p className="flex justify-center gap-2">
              <Play className="w-4 h-4" />
              Watch Video Testimonials
            </p>
          </Button>
          <span className={`mx-4 ${colors.textSecondary}`}>or</span>
          <a href="#reviews" className={`text-sm font-semibold`} style={{ color: accentColor }}>
            Read More Reviews →
          </a>
        </div>
      </div>
    </div>
  );
};


