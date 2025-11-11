import React, { useState, useEffect } from "react";
import KpiCards from "./KpiCards";
import InsightsCarousel from "./InsightsCarousel";
import ForecastCards from "./ForecastCards";
import ForecastChart from "./forecastCharts";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

interface TrendPoint {
  label: string;
  value: number;
}

interface InsightsPanelProps {
  caption?: string;
  insights?: {
    total_sales?: number;
    total_orders?: number;
    top_product?: string;
    sales_growth?: number | string;
    total_profit?: number;
    forecast?: {
      short_term_sales?: string;
      monthly_sales?: string;
      customer_growth?: string;
      inventory_demand?: string;
    };
    sales_trend?: TrendPoint[];
    daily_profit_trend?: TrendPoint[]; // ✅ add this line
    forecast_trend?: TrendPoint[];
    text?: string;
    alerts?: string[];
    ai_recommendations?: string[];
  };
  charts?: {
    line_chart?: string;
    bar_chart?: string;
    heatmap?: string;
  };
  loading?: boolean;
}

// ---------- FORECAST GENERATOR ----------
function generateForecast(salesTrend: TrendPoint[], days = 7): TrendPoint[] {
  if (!salesTrend || salesTrend.length < 2) return [];
  const x = salesTrend.map((_, i) => i);
  const y = salesTrend.map((p) => p.value);

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

  const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - a * sumX) / n;

  const lastLabel =
    salesTrend[salesTrend.length - 1]?.label ||
    new Date().toISOString().split("T")[0];
  const baseDate = new Date(lastLabel);

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i + 1);
    return {
      label: d.toISOString().split("T")[0],
      value: Math.max(0, a * (x.length + i) + b),
    };
  });
}



const InsightsPanel: React.FC<InsightsPanelProps> = ({
  caption = "No file selected",
  insights = {},
  charts = {},
  loading = false,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    console.log("Insights prop:", insights);
  }, [insights]);
  

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % 3);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // ---------- Normalize data ----------
  const totalSales = insights.total_sales ?? 0;
  const totalOrders = insights.total_orders ?? 0;
  const totalProfit = insights.total_profit ?? 0;
  const topProduct = insights.top_product ?? "N/A";
  const salesGrowth = insights.sales_growth ?? 0;
  const salesTrend = insights.sales_trend ?? [];
  const forecastTrend = insights.forecast_trend ?? [];
  const profitTrend = insights.daily_profit_trend ?? [];


  // ---------- Forecast Generation ----------
  const computedForecastTrend =
    forecastTrend.length > 0
      ? forecastTrend
      : salesTrend.length > 0
      ? generateForecast(salesTrend, 30)
      : Array.from({ length: 30 }, (_, i) => ({
          label: `Day ${i + 1}`,
          value: totalSales / 30,
        }));

  // ---------- Forecast Totals ----------
  const totalForecast7Days = computedForecastTrend
    .slice(0, 7)
    .reduce((sum, item) => sum + item.value, 0);
  const totalForecast30Days = computedForecastTrend.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // ---------- Customer Growth ----------
  const customerGrowthPrediction = `+${Number(salesGrowth).toFixed(
    2
  )}% (next month)`;

  const computedForecast = {
    short_term_sales:
      totalForecast7Days > 0
        ? `$${totalForecast7Days.toFixed(2)} (next 7 days)`
        : "Data unavailable",
    monthly_sales:
      totalForecast30Days > 0
        ? `$${totalForecast30Days.toFixed(2)} (next month)`
        : "Data unavailable",
    customer_growth: customerGrowthPrediction,
    inventory_demand:
      totalForecast30Days > 0
        ? `${Math.round(totalForecast30Days / 10)} units (next 30 days)`
        : "Data unavailable",
  };

  return (
    <section className="bg-white rounded-md dark:bg-gray-900 p-6 flex flex-col space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        🧠 Insights & Metrics
      </h2>

      <KpiCards
        totalProfit={totalProfit}
        totalSales={totalSales}
        totalCustomerCount={totalOrders}
        mostSoldProduct={topProduct}
        growthRate={salesGrowth}
      />

      <ForecastChart
        salesTrend={salesTrend}
        forecastTrend={computedForecastTrend}
      />

      {/* Profit Trend Chart */}
      {profitTrend.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-3">
            Profit Trend
          </h3>
          <LineChart width={500} height={250} data={profitTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#16a34a"
              name="Profit"
            />
          </LineChart>
        </div>
      )}

      {/* Insights Carousel */}
      <InsightsCarousel
        slideIdx={slideIdx}
        setSlideIdx={setSlideIdx}
        slides={[
          {
            key: "insights",
            content: (
              <div className="flex flex-col items-center justify-center min-h-[120px]">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
                  General Insights
                </h3>
                <p className="text-gray-700 dark:text-gray-200 text-center">
                  {insights.text ?? "No insights available yet."}
                </p>
              </div>
            ),
          },
          {
            key: "alerts",
            content: (
              <div className="flex flex-col items-center justify-center min-h-[120px]">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
                  Alerts
                </h3>
                {insights.alerts?.length ? (
                  insights.alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 p-3 rounded-lg shadow-sm mb-2 flex items-center gap-2"
                    >
                      <span className="material-icons text-red-500 dark:text-red-300">
                        warning
                      </span>
                      <p>{alert}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No anomalies detected.
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "ai",
            content: (
              <div className="flex flex-col items-center justify-center min-h-[120px]">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
                  AI Recommendations
                </h3>
                {insights.ai_recommendations?.length ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-200 text-left">
                    {insights.ai_recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No AI recommendations yet.
                  </p>
                )}
              </div>
            ),
          },
        ]}
      />

      <ForecastCards forecast={computedForecast} />
    </section>
  );
};


export default InsightsPanel;
