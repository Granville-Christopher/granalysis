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
  const mergedTrend = [
    ...salesTrend.map((d) => ({ ...d, type: "Actual" })),
    ...forecastTrend.map((d) => ({ ...d, type: "Forecast" })),
  ];

  return (
    <section className="bg-white dark:bg-gray-800 p-4 shadow-sm rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        <span className="material-icons align-middle mr-2">show_chart</span>

        Sales Trend & Forecast
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={mergedTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dataKey="value"
            data={mergedTrend.filter((d) => d.type === "Actual")}
            name="Actual Sales"
            stroke="#2563eb"
            dot={false}
          />

          {salesTrend.length > 0 && (
            <ReferenceLine
              x={salesTrend[salesTrend.length - 1].label}
              stroke="gray"
              strokeDasharray="3 3"
              label="Forecast starts"
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            data={mergedTrend.filter((d) => d.type === "Forecast")}
            name="Forecasted Sales"
            stroke="#f97316"
            strokeDasharray="4 4"
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>

      
    </section>

    
  );
};

export default ForecastChart;
