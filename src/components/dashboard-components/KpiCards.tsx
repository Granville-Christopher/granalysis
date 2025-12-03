import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig } from "../../components/home/theme";

interface KpiCardsProps {
  totalProfit: number | string | undefined;
  totalSales: number | string | undefined;
  totalCustomerCount: number | string | undefined;
  mostSoldProduct: string | undefined;
  leastSoldProduct: string | undefined;
  growthRate: number | string | undefined;
  avgOrderValue: number | string | undefined;
  profitMarginPct: number | string | undefined;
  avgProfitPerOrder: number | string | undefined;
  salesVelocity?: number | string | undefined;
  uniqueProductsCount?: number | string | undefined;
}

// Utility: safely parse numbers (handles strings like "10,159" too)
const parseNumber = (val: number | string | undefined): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const KpiCards: React.FC<KpiCardsProps> = React.memo(({
  totalProfit,
  totalSales,
  totalCustomerCount,
  mostSoldProduct,
  leastSoldProduct,
  growthRate,
  avgOrderValue,
  profitMarginPct,
  avgProfitPerOrder,
  salesVelocity,
  uniqueProductsCount,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  
  const totalProfitNum = parseNumber(totalProfit);
  const totalSalesNum = parseNumber(totalSales);
  const totalCustomerNum = parseNumber(totalCustomerCount);
  const growthRateNum = parseNumber(growthRate);
  const avgOrderValueNum = parseNumber(avgOrderValue);
  const profitMarginPctNum = parseNumber(profitMarginPct);
  const avgProfitPerOrderNum = parseNumber(avgProfitPerOrder);
  const salesVelocityNum = parseNumber(salesVelocity);

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Glassmorphic card style with lighter, more transparent colors - NO GLOW
  const getCardStyle = (colorHex: string) => {
    const color1 = hexToRgba(colorHex, isDark ? 0.15 : 0.2);
    const color2 = hexToRgba(colorHex, isDark ? 0.2 : 0.25);
    const borderColor = hexToRgba(colorHex, isDark ? 0.3 : 0.4);
    
    return {
      background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${borderColor}`,
      boxShadow: 'none', // Remove glow
    };
  };

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-600';

  // Helper to format large numbers with abbreviations and return both truncated and full versions
  const formatLargeNumber = (num: number, prefix: string = ''): { display: string; full: string } => {
    const full = prefix + num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    
    // If number is very large, create abbreviated version
    if (num >= 1_000_000_000_000) {
      const trillions = num / 1_000_000_000_000;
      return {
        display: `${prefix}${trillions.toFixed(2)}T...`,
        full: full
      };
    } else if (num >= 1_000_000_000) {
      const billions = num / 1_000_000_000;
      return {
        display: `${prefix}${billions.toFixed(2)}B...`,
        full: full
      };
    } else if (num >= 1_000_000) {
      const millions = num / 1_000_000;
      return {
        display: `${prefix}${millions.toFixed(2)}M...`,
        full: full
      };
    }
    
    return {
      display: full,
      full: full
    };
  };

  const totalSalesFormatted = formatLargeNumber(totalSalesNum, '$');
  const totalProfitFormatted = formatLargeNumber(totalProfitNum, '$');
  const customerCountFormatted = formatLargeNumber(totalCustomerNum);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-3">
      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#3b82f6')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Total Sales</h3>
        <p className="text-lg font-bold mt-1 truncate">
          {totalSalesFormatted.display}
        </p>
        {totalSalesFormatted.display !== totalSalesFormatted.full && (
          <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>{totalSalesFormatted.full}</p>
        )}
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#a855f7')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Total Profit</h3>
        <p className="text-lg font-bold mt-1 truncate">
          {totalProfitFormatted.display}
        </p>
        {totalProfitFormatted.display !== totalProfitFormatted.full && (
          <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>{totalProfitFormatted.full}</p>
        )}
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#10b981')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Customer Count</h3>
        <p className="text-lg font-bold mt-1 truncate">
          {customerCountFormatted.display}
        </p>
        {customerCountFormatted.display !== customerCountFormatted.full && (
          <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>{customerCountFormatted.full}</p>
        )}
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#eab308')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Most Sold Product</h3>
        <p className="text-sm font-bold mt-1 truncate" title={mostSoldProduct || "N/A"}>
          {mostSoldProduct ?? "N/A"}
        </p>
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#f97316')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Least Sold Product</h3>
        <p className="text-sm font-bold mt-1 truncate" title={leastSoldProduct || "N/A"}>
          {leastSoldProduct ?? "N/A"}
        </p>
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#ef4444')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Sales Growth Rate</h3>
        <p className="text-lg font-bold mt-1 truncate">{growthRateNum.toFixed(2)}%</p>
        <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>CAGR (Regression-Based)</p>
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#6366f1')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Avg Order Value</h3>
        {(() => {
          const formatted = formatLargeNumber(avgOrderValueNum, '$');
          return (
            <>
              <p className="text-lg font-bold mt-1 truncate">
                {formatted.display}
              </p>
              {formatted.display !== formatted.full && (
                <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>{formatted.full}</p>
              )}
            </>
          );
        })()}
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#14b8a6')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Profit Margin</h3>
        <p className="text-lg font-bold mt-1 truncate">{profitMarginPctNum.toFixed(2)}%</p>
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#ec4899')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Avg Profit/Order</h3>
        {(() => {
          const formatted = formatLargeNumber(avgProfitPerOrderNum, '$');
          return (
            <>
              <p className="text-lg font-bold mt-1 truncate">
                {formatted.display}
              </p>
              {formatted.display !== formatted.full && (
                <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>{formatted.full}</p>
              )}
            </>
          );
        })()}
      </div>

      <div className={`${textColor} p-3 rounded-lg relative transition-all duration-300`} style={getCardStyle('#06b6d4')}>
        <h3 className={`text-xs font-medium ${textSecondaryColor}`}>Sales Velocity</h3>
        {(() => {
          const formatted = formatLargeNumber(salesVelocityNum, '$');
          const displayWithSuffix = formatted.display + '/day';
          const fullWithSuffix = formatted.full + '/day';
          return (
            <>
              <p className="text-lg font-bold mt-1 truncate">
                {displayWithSuffix}
              </p>
              {formatted.display !== formatted.full && (
                <p className={`text-[10px] ${textSecondaryColor} mt-0.5 opacity-75`}>{fullWithSuffix}</p>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
});

KpiCards.displayName = 'KpiCards';

export default KpiCards;
