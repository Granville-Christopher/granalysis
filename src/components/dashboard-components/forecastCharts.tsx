// src/components/dashboard-components/forecastCharts.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../../components/home/theme";

export interface TrendPoint {
  label: string;
  value: number;
}

interface ForecastChartProps {
  salesTrend: TrendPoint[];
  forecastTrend: TrendPoint[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({
  salesTrend,
  forecastTrend,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  // Merge data properly: actual sales + forecast, ensuring continuity
  const lastActualPoint = salesTrend.length > 0 ? salesTrend[salesTrend.length - 1] : null;
  const firstForecastPoint = forecastTrend.length > 0 ? forecastTrend[0] : null;
  
  // Create merged data with both actual and forecast values
  // Add a bridge point at the last actual point to connect forecast smoothly
  const mergedTrend = [
    ...salesTrend.map((d) => ({ ...d, actual: d.value, forecast: null })),
    // Bridge point: Add forecast value to last actual point for smooth connection
    ...(lastActualPoint && firstForecastPoint ? [{
      label: lastActualPoint.label,
      actual: lastActualPoint.value,
      forecast: firstForecastPoint.value, // Start forecast from last actual point
    }] : []),
    // Add remaining forecast points
    ...forecastTrend
      .filter((d) => !lastActualPoint || d.label !== lastActualPoint.label)
      .map((d) => ({ ...d, actual: null, forecast: d.value })),
  ];

  return (
    <section className={`${glassmorphismClass} p-4 rounded-xl w-full`} style={{ boxShadow: colors.cardShadow }}>
      <h2 className={`text-xl font-semibold ${colors.text} mb-2`}>
        <span className="material-icons align-middle mr-2">show_chart</span>

        Sales Trend & Forecast
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={mergedTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
          <XAxis dataKey="label" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
          <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: colors.isDark ? '#ffffff' : '#111827'
            }}
          />
          <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />

          {/* Actual Sales Line */}
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Sales"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />

          {/* Reference line to show where forecast starts */}
          {lastActualPoint && firstForecastPoint && (
            <ReferenceLine
              x={lastActualPoint.label}
              stroke={colors.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}

          {/* Forecast Line - extends from last actual point */}
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecasted Sales"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>

      
    </section>

    
  );
};

export default ForecastChart;
