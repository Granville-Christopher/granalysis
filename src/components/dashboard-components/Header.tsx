import React, { useState, useEffect, useRef } from "react";
import { LogOut, Download, User, Table, Sun, Moon, File, X, CreditCard, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  onLogout?: () => void;
  user?: { fullName?: string; email?: string; pricingTier?: string } | null;
  onViewDataTable?: () => void;
  hasData?: boolean;
  onShowUpgradeModal?: (limitType: 'files' | 'rows' | 'export', exportType?: 'csv' | 'excel' | 'pdf' | 'sql') => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user, onViewDataTable, hasData, onShowUpgradeModal }) => {
  const { isDark, toggleTheme } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const navigate = useNavigate();
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const printMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (printMenuRef.current && !printMenuRef.current.contains(event.target as Node)) {
        setShowPrintMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showPrintMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrintMenu, showUserMenu]);

  const printSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales', label: 'Sales & Revenue' },
    { id: 'customer', label: 'Customer Analytics' },
    { id: 'product', label: 'Product Analytics' },
    { id: 'financial', label: 'Financial & Operations' },
    { id: 'enterprise', label: 'Enterprise Insights' },
  ];

  const handlePrint = (sectionId: string) => {
    setShowPrintMenu(false);
    
    // Inject print styles
    const styleId = 'print-section-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      @media print {
        @page {
          margin: 0.5in;
        }
        * {
          visibility: hidden;
        }
        [data-print-section="${sectionId}"],
        [data-print-section="${sectionId}"] * {
          visibility: visible !important;
        }
        [data-print-section="${sectionId}"] {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          display: block !important;
        }
        body * {
          visibility: hidden;
        }
        body {
          margin: 0;
          padding: 0;
        }
        header,
        nav,
        aside,
        button,
        [data-insights-panel] > div:first-child,
        [data-insights-panel] > div:first-child *,
        [data-tab-navigation] {
          display: none !important;
          visibility: hidden !important;
        }
        [data-print-section="${sectionId}"] {
          page-break-inside: avoid;
        }
      }
    `;

    // Trigger print
    window.print();

    // Clean up after printing
    setTimeout(() => {
      if (styleElement) {
        styleElement.remove();
      }
    }, 1000);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 flex flex-col md:flex-row items-center p-4 transition-all duration-300 ${glassmorphismClass} rounded-none`}
      style={{
        minHeight: "72px",
        backdropFilter: "blur(20px)",
        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        boxShadow: colors.cardShadow,
        borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      <h1 className={`text-2xl sm:text-3xl font-bold ${colors.text}`} style={{ color: colors.accent }}>
        📊 Granalysis
      </h1>
      <div className="flex-1 flex justify-center w-full">
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {hasData && onViewDataTable && (
            <button
              onClick={onViewDataTable}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                boxShadow: `0 4px 15px ${colors.accent}40`,
              }}
            >
              <Table className="w-4 h-4" />
              <span>View Data Table</span>
            </button>
          )}
          <button
            onClick={() => {
              const tier = (user?.pricingTier || 'free') as string;
              if (tier === 'free') {
                onShowUpgradeModal?.('export', 'csv');
              } else {
                // Trigger CSV export download
                fetch('/files/export.csv', { credentials: 'include' })
                  .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to export CSV');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'files-export.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  })
                  .catch((e) => console.error(e));
              }
            }}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
            style={{
              background: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`,
              boxShadow: `0 4px 15px rgba(22, 163, 74, 0.4)`,
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              const tier = (user?.pricingTier || 'free') as string;
              if (tier === 'free' || tier === 'startup') {
                onShowUpgradeModal?.('export', 'excel');
              } else {
                // Trigger Excel export (served as CSV with Excel MIME)
                fetch('/files/export.xlsx', { credentials: 'include' })
                  .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to export Excel');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'files-export.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  })
                  .catch((e) => console.error(e));
              }
            }}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
            style={{
              background: `linear-gradient(135deg, #eab308 0%, #ca8a04 100%)`,
              boxShadow: `0 4px 15px rgba(234, 179, 8, 0.4)`,
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => {
              const tier = (user?.pricingTier || 'free') as string;
              if (tier === 'free' || tier === 'startup') {
                onShowUpgradeModal?.('export', 'pdf');
              } else {
                // TODO: Implement PDF export
                console.log('Export PDF');
              }
            }}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
              boxShadow: `0 4px 15px ${colors.accent}40`,
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => {
              const tier = (user?.pricingTier || 'free') as string;
              if (tier !== 'enterprise') {
                onShowUpgradeModal?.('export', 'sql');
              } else {
                // TODO: Implement SQL export
                console.log('Export SQL');
              }
            }}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
              boxShadow: `0 4px 15px ${colors.accent}40`,
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export SQL</span>
          </button>
          {hasData && (
            <div className="relative" ref={printMenuRef}>
              <button
                onClick={() => setShowPrintMenu(!showPrintMenu)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
                style={{
                  background: `linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)`,
                  boxShadow: `0 4px 15px rgba(99, 102, 241, 0.4)`,
                }}
              >
                <File className="w-4 h-4" />
                <span>Print</span>
              </button>
              {showPrintMenu && (
                <div
                  className={`absolute top-full mt-2 right-0 ${glassmorphismClass} rounded-lg shadow-lg z-50 min-w-[220px]`}
                  style={{
                    backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    boxShadow: colors.cardShadow,
                    border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  <div className="p-2">
                    <div className="flex justify-between items-center mb-2 px-2">
                      <span className={`text-sm font-semibold ${colors.text}`}>Select Section</span>
                      <button
                        onClick={() => setShowPrintMenu(false)}
                        className={`p-1 rounded ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      >
                        <X className={`w-4 h-4 ${colors.text}`} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {printSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handlePrint(section.id)}
                          className={`w-full text-left px-3 py-2 rounded transition-colors ${
                            colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                          } ${colors.text}`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-auto mt-4 md:mt-0">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-200 ${
            colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5" style={{ color: colors.accent }} />
          )}
        </button>
        {user?.pricingTier && (
          <button
            onClick={() => navigate('/pricing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
            } ${colors.text}`}
          >
            {user.pricingTier.charAt(0).toUpperCase() + user.pricingTier.slice(1)}
          </button>
        )}
        {/* Direct Account Link */}
        <button
          type="button"
          onClick={(e) => {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            // Use window.location for guaranteed immediate navigation
            window.location.href = '/account';
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
          style={{
            backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          }}
          title="Account Settings"
        >
          <Settings className="w-4 h-4" style={{ color: colors.accent }} />
          <span className={`text-sm font-semibold hidden md:inline ${colors.text}`}>Account</span>
        </button>
        {/* User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }}
            title="User Menu"
          >
            <User className="w-4 h-4" style={{ color: colors.accent }} />
            <span className={`text-sm font-semibold hidden md:inline ${colors.text}`}>
              {user?.fullName || user?.email}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} style={{ color: colors.accent }} />
          </button>
          {showUserMenu && (
            <div
              className={`absolute top-full mt-2 right-0 ${glassmorphismClass} rounded-lg shadow-lg z-50 min-w-[200px]`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                boxShadow: colors.cardShadow,
                border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <div className="p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    setShowUserMenu(false);
                    // Use window.location for guaranteed immediate navigation
                    window.location.href = '/account';
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                    colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  } ${colors.text}`}
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    setShowUserMenu(false);
                    // Use window.location for guaranteed immediate navigation
                    window.location.href = '/payment-history';
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                    colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  } ${colors.text}`}
                >
                  <CreditCard className="w-4 h-4" />
                  Payment History
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-white`}
          style={{
            background: `linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)`,
            boxShadow: `0 4px 15px rgba(220, 38, 38, 0.4)`,
          }}
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
