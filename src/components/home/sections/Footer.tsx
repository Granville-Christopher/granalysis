import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeConfig } from '../theme';
import { Mail, Linkedin, Github, ArrowUp, } from "lucide-react";
import { Button } from '../ui/Button';
import { toast } from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

export const Footer = ({ colors }: { colors: ThemeConfig }) => {
  const [email, setEmail] = useState('');
  const accentColor = colors.accent;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`py-12 border-t ${
        colors.isDark ? "border-white/10" : "border-gray-300"
      }`}
      style={{ background: colors.secondaryBg }}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2">
            <h3
              className={`md:text-3xl text-2xl font-bold mb-4`}
              style={{ color: accentColor }}
            >
              Granalysis
            </h3>
            <p className={`md:text-sm text-xs mb-4 ${colors.textSecondary}`}>
              AI-Powered insights for exponential business growth.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mb-6">
              <a
                href="https://x.com/granalysis"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all duration-300 ${
                  colors.isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Twitter"
              >
                <FontAwesomeIcon
                  icon={faXTwitter}
                  className="w-5 h-5"
                  style={{ color: accentColor }}
                />
              </a>
              <a
                href="https://linkedin.com/company/granalysis"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all duration-300 ${
                  colors.isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" style={{ color: accentColor }} />
              </a>
              <a
                href="https://github.com/granalysis"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all duration-300 ${
                  colors.isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" style={{ color: accentColor }} />
              </a>
            </div>

            {/* Newsletter Signup */}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  colors.isDark
                    ? "bg-white/5 border-white/10 placeholder-gray-400"
                    : "bg-white border-gray-200 placeholder-gray-500"
                } ${colors.text}`}
                style={
                  { "--tw-ring-color": accentColor } as React.CSSProperties & {
                    "--tw-ring-color"?: string;
                  }
                }
                required
              />
              <Button colors={colors} type="submit" className="px-4">
                <Mail className="w-4 h-4" />
              </Button>
            </form>
          </div>
          <div>
            <h4 className={`font-semibold mb-3 ${colors.text}`}>Product</h4>
            <ul className={`space-y-2 text-sm ${colors.textSecondary}`}>
              <li>
                <a
                  href="#features"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Solutions
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold mb-3 ${colors.text}`}>Company</h4>
            <ul className={`space-y-2 text-sm ${colors.textSecondary}`}>
              <li>
                <a
                  href="#about"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold mb-3 ${colors.text}`}>Legal</h4>
            <ul className={`space-y-2 text-sm ${colors.textSecondary}`}>
              <li>
                <a
                  href="#security"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Trust & Security
                </a>
              </li>
              <li>
                <Link
                  to="/terms"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className={`hover:${colors.text} transition-colors`}
                  style={{ color: "inherit" }}
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center ${
            colors.isDark ? "border-white/10" : "border-gray-300"
          }`}
        >
          <div className={`text-xs ${colors.textSecondary} mb-4 md:mb-0`}>
            &copy; {new Date().getFullYear()} Granalysis. All rights reserved.
          </div>
          <button
            onClick={scrollToTop}
            className={`flex items-center gap-2 px-4 py-2 my-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              colors.isDark
                ? "bg-white/10 hover:bg-white/20"
                : "bg-gray-100 hover:bg-gray-200"
            } ${colors.text}`}
          >
            <ArrowUp className="w-4 h-4" />
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

