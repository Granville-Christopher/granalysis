import React, { useState, useEffect, useRef } from "react";
import { LogOut, Download, User, Table, Sun, Moon, File, X, CreditCard, Settings, ChevronDown, Share2, Activity, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";
import SupportMessages from "./SupportMessages";
import api from "../../utils/axios";

interface HeaderProps {
  onLogout?: () => void;
  user?: { fullName?: string; email?: string; pricingTier?: string } | null;
  onViewDataTable?: () => void;
  hasData?: boolean;
  onShowUpgradeModal?: (limitType: 'files' | 'rows' | 'export', exportType?: 'csv' | 'excel' | 'pdf' | 'sql') => void;
  onShareInsights?: () => void;
  selectedFileId?: number | null;
  selectedFileName?: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user, onViewDataTable, hasData, onShowUpgradeModal, onShareInsights, selectedFileId, selectedFileName }) => {
  const { isDark, toggleTheme } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const navigate = useNavigate();
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupportMessages, setShowSupportMessages] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const printMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch unread messages count for user
  const fetchUnreadCount = async () => {
    if (!user?.pricingTier || !['startup', 'business', 'enterprise'].includes(user.pricingTier)) {
      return;
    }
    try {
      const response = await api.get('/messages', { withCredentials: true });
      if (response.data?.status === 'success' && response.data.tickets) {
        // Calculate unread messages from admins
        let unreadCount = 0;
        response.data.tickets.forEach((ticket: any) => {
          if (!ticket.messages || ticket.messages.length === 0) return;
          if (!ticket.readBy?.user) {
            // If user never read, count all admin messages
            unreadCount += ticket.messages.filter((m: any) => m.senderType === 'admin').length;
          } else {
            // Count messages after last read time
            const lastReadTime = new Date(ticket.readBy.user).getTime();
            unreadCount += ticket.messages.filter((m: any) => 
              m.senderType === 'admin' && new Date(m.createdAt).getTime() > lastReadTime
            ).length;
          }
        });
        setUnreadMessagesCount(unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Poll for unread counts
  useEffect(() => {
    if (!user?.pricingTier || !['startup', 'business', 'enterprise'].includes(user.pricingTier)) {
      return;
    }
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user?.pricingTier]);

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
    <>
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
          {hasData && selectedFileId && onShareInsights && (
            <button
              onClick={onShareInsights}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-white`}
              style={{
                background: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)`,
                boxShadow: `0 4px 15px rgba(139, 92, 246, 0.4)`,
              }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share Insights</span>
            </button>
          )}
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
        {/* Monitoring Dashboard Link */}
        {(user?.pricingTier === 'business' || user?.pricingTier === 'enterprise') && (
          <button
            type="button"
            onClick={() => navigate('/monitoring')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }}
            title="System Monitoring"
          >
            <Activity className="w-4 h-4" style={{ color: colors.accent }} />
            <span className={`text-sm font-semibold hidden md:inline ${colors.text}`}>Monitoring</span>
          </button>
        )}
        {/* Support Messages - Only for Startup, Business, Enterprise tiers */}
        {user?.pricingTier && ['startup', 'business', 'enterprise'].includes(user.pricingTier) && (
          <button
            type="button"
            onClick={() => setShowSupportMessages(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80 relative"
            style={{
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }}
            title="Support Messages"
          >
            <MessageSquare className="w-4 h-4" style={{ color: colors.accent }} />
            <span className={`text-sm font-semibold hidden md:inline ${colors.text}`}>Support</span>
            {unreadMessagesCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  minWidth: '18px',
                  textAlign: 'center',
                  border: `2px solid ${colors.isDark ? '#0B1B3B' : '#ffffff'}`,
                }}
              >
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </div>
            )}
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

    {/* Support Messages Modal */}
    {showSupportMessages && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowSupportMessages(false)}
      >
        <div
          style={{
            background: colors.isDark ? '#1a1a2e' : '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>Support Messages</h2>
            <button
              onClick={() => setShowSupportMessages(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text,
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              <X size={24} />
            </button>
          </div>
          <SupportMessages />
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
