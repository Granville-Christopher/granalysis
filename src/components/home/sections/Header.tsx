import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, ArrowUp } from 'lucide-react';
import { Theme, ThemeConfig } from '../theme';
import { Button } from '../ui/Button';

export const Header = ({ theme, toggleTheme, colors }: { theme: Theme; toggleTheme: () => void; colors: ThemeConfig }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const links = ['Features', 'Solutions', 'Impact', 'FAQ', 'Pricing', 'Security'];
  const accentColor = colors.accent;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;
      const progress = Math.min((scrollY / scrollableHeight) * 100, 100);
      
      setIsScrolled(scrollY > 50);
      setScrollProgress(progress);
      setShowStickyCTA(scrollY > windowHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const headerStyle = {
    backgroundColor: isScrolled ? colors.headerScrolled : colors.headerBg,
    backdropFilter: 'blur(10px)',
    boxShadow: isScrolled
      ? `0 4px 30px rgba(0, 0, 0, ${colors.isDark ? 0.4 : 0.1}), 0 0 15px rgba(29, 78, 216, 0.3)`
      : `0 4px 15px rgba(0, 0, 0, 0.2)`,
  };

  const borderClass = colors.isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 p-2 md:p-4">
        {/* Progress Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
          style={{
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${scrollProgress}%, transparent ${scrollProgress}%)`,
            opacity: isScrolled ? 1 : 0
          }}
        />
        
        <div
          className={`w-full max-w-7xl mx-auto flex justify-between items-center rounded-full px-2.5 py-2 md:p-4 border transition-all duration-300 ${borderClass}`}
          style={headerStyle}
        >
          <a
            href="#home"
            onClick={scrollToTop}
            className="md:text-3xl text-2xl font-extrabold tracking-tight cursor-pointer transition-colors duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
            style={{ color: accentColor }}
          >
            Granalysis
          </a>

          <nav className="hidden lg:flex space-x-8">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                className={`${colors.textSecondary} font-medium text-lg hover:${colors.text} transition-colors duration-300 relative group focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2`}
              >
                {link}
                <span
                  className={`absolute bottom-[-5px] left-2 right-2 h-0.5 transition-all duration-300 scale-x-0 group-hover:scale-x-100`}
                  style={{ backgroundColor: accentColor }}
                ></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-300 ${colors.text} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              aria-label="Toggle theme"
              style={{
                backgroundColor: colors.isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)"
              }}
            >
              {colors.isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800" />
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button colors={colors}>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button glow={true} variant="secondary" colors={colors}>
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Toggle menu"
              style={{
                backgroundColor: colors.isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)"
              }}
            >
              {isMobileMenuOpen ? (
                <X className={`w-5 h-5 ${colors.text}`} />
              ) : (
                <Menu className={`w-5 h-5 ${colors.text}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden mt-2 mx-4 rounded-2xl border backdrop-blur-md transition-all duration-300"
            style={{
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <nav className="flex flex-col p-4 space-y-4">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${colors.text} font-medium text-lg py-2 px-4 rounded-lg hover:opacity-80 transition-colors focus:outline-none focus:ring-2`}
                  style={{ 
                    backgroundColor: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {link}
                </a>
              ))}
              <div className="pt-4 border-t" style={{ borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button colors={colors} className="w-full mb-2">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button glow={true} variant="secondary" colors={colors} className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Sticky CTA Button */}
      {showStickyCTA && (
        <div className="fixed bottom-24 right-6 z-40 transition-all duration-300">
          <Link to="/signup">
            <Button 
              colors={colors} 
              className="shadow-2xl animate-pulse"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      )}

      {/* Back to Top Button */}
      {isScrolled && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Back to top"
            style={{
            backgroundColor: accentColor,
            color: colors.isDark ? '#0B1B3B' : 'white',
            boxShadow: colors.isDark 
              ? `0 4px 20px rgba(79, 163, 255, 0.4)` 
              : `0 4px 15px rgba(29, 78, 216, 0.3)`
          }}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};


