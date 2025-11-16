import React from "react";
import { Menu } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_CONFIG } from "../home/theme";

interface ToggleSidebarButtonProps {
  onClick: () => void;
}

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({
  onClick,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;

  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-20 left-4 z-50 p-3 flex items-center justify-center rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        color: colors.text,
        border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        backdropFilter: 'blur(10px)',
      }}
      aria-label="Open sidebar"
    >
      <Menu className="w-6 h-6" style={{ color: colors.accent }} />
    </button>
  );
};

export default ToggleSidebarButton;
