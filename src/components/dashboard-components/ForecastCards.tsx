import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../../components/home/theme";

interface ForecastCardsProps {
  forecast?: {
    short_term_sales?: string;
    monthly_sales?: string;
    customer_growth?: string;
    customer_growth_overall?: string;
    inventory_demand?: string;
  };
}

const ForecastCards: React.FC<ForecastCardsProps> = ({ forecast = {} }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getCardStyle = (colorHex: string) => {
    const bgColor = hexToRgba(colorHex, isDark ? 0.15 : 0.2);
    const borderColor = hexToRgba(colorHex, isDark ? 0.3 : 0.4);
    
    return {
      background: bgColor,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${borderColor}`,
    };
  };


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div className={`rounded-lg p-4 flex flex-col h-full ${glassmorphismClass}`} style={getCardStyle('#3b82f6')}>
        <h4 className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
          Short-term Sales Forecast
        </h4>
        <p className={`text-lg font-bold ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
          {forecast.short_term_sales || "$0 (next 7 days)"}
        </p>
        <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
          {forecast.monthly_sales || "$0 (next month)"}
        </p>
      </div>

      <div className={`rounded-lg p-4 flex flex-col h-full ${glassmorphismClass}`} style={getCardStyle('#10b981')}>
        <h4 className={`text-sm font-semibold ${isDark ? 'text-green-300' : 'text-green-700'} mb-1`}>
          Customer Growth Prediction
        </h4>
        <p className={`text-lg font-bold ${isDark ? 'text-green-100' : 'text-green-900'}`}>
          {forecast.customer_growth || "+0.0% (next month)"}
        </p>
        <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'} mt-1`}>
          {forecast.customer_growth_overall
            ? `Overall growth: ${forecast.customer_growth_overall}`
            : "Based on recent trends"}
        </p>
      </div>

      <div className={`rounded-lg p-4 flex flex-col h-full ${glassmorphismClass}`} style={getCardStyle('#eab308')}>
        <h4 className={`text-sm font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-700'} mb-1`}>
          Inventory Demand Projection
        </h4>
        <p className={`text-lg font-bold ${isDark ? 'text-yellow-100' : 'text-yellow-900'}`}>
          {forecast.inventory_demand || "0 units (next 30 days)"}
        </p>
        <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mt-1`}>
          Helps with planning stock levels
        </p>
      </div>
    </div>
  );
};

export default ForecastCards;
