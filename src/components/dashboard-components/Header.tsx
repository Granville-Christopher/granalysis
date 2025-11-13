import React from "react";
import { LogOut, Download, User, Table, Sun, Moon } from "lucide-react";
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

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 flex flex-col md:flex-row items-center p-4 transition-all duration-300 ${glassmorphismClass}`}
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
                // TODO: Implement CSV export
                console.log('Export CSV');
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
                // TODO: Implement Excel export
                console.log('Export Excel');
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
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" style={{ color: colors.accent }} />
          <span className={`text-sm font-semibold ${colors.text}`}>
            {user?.fullName || user?.email}
          </span>
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
