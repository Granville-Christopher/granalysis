import React, { useState } from 'react';
import { Cloud, Database, Lock, ShieldCheck, Users, Zap, FileText, ExternalLink } from 'lucide-react';
import { ThemeConfig, getGlassmorphismClass } from '../theme';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ScrollReveal } from '../ui/ScrollReveal';
import { Button } from '../ui/Button';

export const TrustAndSecuritySection = ({ colors }: { colors: ThemeConfig }) => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const stats = [
    { label: 'Active Users', value: 5000, suffix: '+', icon: Users },
    { label: 'AI Models Deployed', value: 12, suffix: '+', icon: Zap },
    { label: 'Rows Analyzed', value: 10, suffix: 'M+', icon: Database },
  ];
  const glassmorphismClass = getGlassmorphismClass(colors);
  const accentColor = colors.accent;

  const StatBlock = ({ icon: Icon, value, label, iconColor }: { icon: any; value: React.ReactNode; label: string; iconColor?: string }) => (
    <div className="flex flex-col items-center p-4 transition-transform duration-300 hover:scale-110">
      <Icon className={`md:w-10 md:h-10 w-6 h-6 mb-2 transition-colors duration-300`} style={{ color: iconColor || accentColor, stroke: iconColor || accentColor, '--icon-color': iconColor || accentColor } as React.CSSProperties} />
      <div className={`md:text-4xl text-2xl font-extrabold ${colors.text} text-shadow-glow`} style={{ textShadow: colors.isDark ? `0 0 10px ${accentColor}` : 'none' }}>{value}</div>
      <div className={`md:text-sm text-xs font-light uppercase tracking-wider mt-1 ${colors.textSecondary}`}>{label}</div>
    </div>
  );

  const securityItems = [
    { 
      title: 'SOC 2 Type II', 
      description: 'Annual audit ensuring data protection and privacy controls.', 
      icon: ShieldCheck, 
      color: 'text-green-500',
      link: '#compliance',
      badge: 'Certified'
    },
    { 
      title: 'GDPR Compliant', 
      description: 'Full adherence to European Union data privacy regulations.', 
      icon: Database, 
      color: 'text-cyan-500',
      link: '#compliance',
      badge: 'Certified'
    },
    { 
      title: '256-bit Encryption', 
      description: 'All data is encrypted both in transit (TLS) and at rest (AES-256).', 
      icon: Lock, 
      color: 'text-yellow-500',
      link: '#security',
      badge: 'Enterprise'
    },
    { 
      title: 'Google Cloud Hosted', 
      description: 'Leveraging Google Cloud infrastructure for redundancy and security.', 
      icon: Cloud, 
      color: 'text-pink-500',
      link: '#infrastructure',
      badge: 'Verified'
    },
  ];

  return (
    <div
      className="py-24 transition-colors duration-500 border-b-2 border-blue-300/10"
      id="security"
      style={{ background: colors.isDark ? colors.bg : `linear-gradient(180deg, #FFFFFF 0%, #F0F4F8 100%)` }}
    >
      <div className="container mx-auto px-6">
        <h2 className={`md:text-5xl text-3xl font-bold text-center mb-16 ${colors.text}`}>
          Security & Trust Signals
        </h2>

        <ScrollReveal className="mb-20">
          <div
            className={`md:p-8 p-4 ${glassmorphismClass} mx-auto max-w-4xl grid grid-cols-3`}
          >
            {stats.map((stat, index) => (
              <StatBlock
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                iconColor={index === 0 ? '#3b82f6' : index === 1 ? '#fbbf24' : '#10b981'}
                value={
                  <>
                    <AnimatedNumber endValue={stat.value} />
                    {stat.suffix}
                  </>
                }
              />
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {securityItems.map((item, index) => (
            <ScrollReveal key={index} className="h-full">
              <div
                className={`p-6 flex items-center h-full ${glassmorphismClass} border-l-4 transition-all duration-300 cursor-pointer ${
                  hoveredBadge === item.title ? "scale-105" : ""
                } ${
                  colors.isDark
                    ? "hover:shadow-[0_0_25px_rgba(79,163,255,0.3)]"
                    : "hover:shadow-xl"
                }`}
                style={{ borderColor: accentColor }}
                onMouseEnter={() => setHoveredBadge(item.title)}
                onMouseLeave={() => setHoveredBadge(null)}
                onClick={() => (window.location.href = item.link)}
              >
                <div className="relative">
                  <item.icon
                    className="w-8 h-8 mr-4 transition-transform duration-300"
                    style={{ 
                      color: index === 0 ? '#22c55e' : index === 1 ? '#06b6d4' : index === 2 ? '#fbbf24' : '#ec4899',
                      stroke: index === 0 ? '#22c55e' : index === 1 ? '#06b6d4' : index === 2 ? '#fbbf24' : '#ec4899',
                      fill: index === 0 ? 'rgba(34, 197, 94, 0.3)' : index === 1 ? 'rgba(6, 182, 212, 0.3)' : index === 2 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(236, 72, 153, 0.3)',
                      '--icon-color': index === 0 ? '#22c55e' : index === 1 ? '#06b6d4' : index === 2 ? '#fbbf24' : '#ec4899',
                      '--icon-fill': index === 0 ? 'rgba(34, 197, 94, 0.3)' : index === 1 ? 'rgba(6, 182, 212, 0.3)' : index === 2 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(236, 72, 153, 0.3)',
                      transform: hoveredBadge === item.title ? "scale(1.1)" : "scale(1)"
                    } as React.CSSProperties}
                  />
                </div>
                <div>
                  <span
                    className={`md:absolute md:-top-2 md:-right-2 absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                      colors.isDark
                        ? "bg-green-900/40 text-green-400 border border-green-500/40"
                        : "bg-green-100 text-green-700 border border-green-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-xl font-semibold mb-1 ${colors.text}`}
                      >
                        {item.title}
                      </h3>
                      <ExternalLink
                        className={`w-4 h-4 opacity-0 transition-opacity duration-300 ${
                          hoveredBadge === item.title ? "opacity-100" : ""
                        }`}
                        style={{ color: accentColor }}
                      />
                    </div>
                    <p className={`text-sm ${colors.textSecondary}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center">
          <Button
            colors={colors}
            variant="secondary"
            onClick={() => (window.location.href = "#compliance")}
            className="inline-flex items-center gap-2"
          >
            <p className="flex justify-center gap-2">
              <FileText className="w-4 h-4" style={{ color: accentColor, stroke: accentColor, '--icon-color': accentColor } as React.CSSProperties} />
              View Compliance Documents
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
};

