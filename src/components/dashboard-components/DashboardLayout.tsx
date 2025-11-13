import React from "react";
import { THEME_CONFIG, ThemeConfig } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  return (
    <div
      className="flex min-h-screen font-sans transition-colors duration-300"
      style={{
        background: colors.isDark
          ? `linear-gradient(135deg, #0B1B3B 0%, #1A345B 50%, #0B1B3B 100%)`
          : `linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 50%, #F9FAFB 100%)`,
      }}
    >
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              backgroundColor: colors.isDark
                ? "rgba(79, 163, 255, 0.2)"
                : "rgba(29, 78, 216, 0.15)",
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.random() * 3 + 2 + "s",
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default DashboardLayout;
