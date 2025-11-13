import React, { useEffect } from "react";
import KpiCards from "./KpiCards";
import ForecastCards from "./ForecastCards";
import ForecastChart from "./forecastCharts";
import AdvancedInsights from "./AdvancedInsights";
import AIInsightsPanel from "./AIInsightsPanel";
import InsightsMarquee from "./InsightsMarquee";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../../components/home/theme";
import { hasFeatureAccess, getFeatureLimit, PricingTier } from "../../utils/featureAccess";

interface TrendPoint {
  label: string;
  value: number;
}

export interface InsightsPanelProps {
  caption?: string;
  userTier?: 'free' | 'startup' | 'business' | 'enterprise';
  insights?: {
    total_sales?: number;
    total_orders?: number;
    top_product?: string;
    least_sold_product?: string;
    sales_growth?: number | string;
    total_profit?: number;
    avg_order_value?: number;
    profit_margin_pct?: number;
    avg_profit_per_order?: number;
    revenue_per_customer?: number;
    most_profitable_product?: string;
    least_profitable_product?: string;
    product_margin_analysis?: Array<{ product_name: string; margin_pct: number; total_profit: number; total_sales: number }>;
    top_customer?: string;
    top_customer_revenue?: number;
    repeat_customer_rate?: number;
    unique_customers?: number;
    top_region?: string;
    regional_performance?: Array<{ region: string; total_sales: number; total_profit: number }>;
    peak_sales_day?: string;
    day_of_week_performance?: Array<{ day: string; sales: number }>;
    revenue_concentration_pct?: number;
    products_to_discontinue?: Array<{ product_name: string; total_sales: number; margin_pct: number }>;
    unique_products_count?: number;
    avg_sales_per_product?: number;
    sales_velocity?: number;
    forecast?: {
      short_term_sales?: string;
      monthly_sales?: string;
      customer_growth?: string;
      inventory_demand?: string;
    };
    sales_trend?: TrendPoint[];
    daily_profit_trend?: TrendPoint[];
    forecast_trend?: TrendPoint[];
    text?: string;
    alerts?: string[];
    ai_recommendations?: string[];
    ai_opportunities?: string[];
    ai_risks?: string[];
    ai_anomalies?: string[];
    // Enterprise Insights
    avg_clv?: number;
    basket_size?: number;
    inventory_turnover?: number;
    days_of_inventory?: number;
    avg_roi?: number;
    rfm_segments?: { [key: string]: number };
    // New Insights
    monthly_trends?: Array<{ month: string; sales: number }>;
    top_customers_list?: Array<{ customer: string; revenue: number }>;
    payment_method_analysis?: Array<{ payment_method: string; total_revenue: number; transaction_count: number; percentage: number }>;
    top_products_by_volume?: Array<{ product: string; quantity: number }>;
    product_performance_matrix?: Array<{ product: string; sales_volume: number; profit_margin: number; total_profit: number; quantity: number }>;
    price_range_analysis?: Array<{ range: string; count: number }>;
    price_distribution?: Array<{ price_range: string; count: number }>;
    customer_acquisition_trends?: Array<{ month: string; new_customers: number }>;
    product_lifecycle?: Array<{ product: string; stage: string; total_sales: number; order_count: number }>;
    regional_profit_comparison?: Array<{ region: string; total_sales: number; total_profit: number; profit_margin: number }>;
    quantity_vs_revenue?: Array<{ product: string; quantity: number; revenue: number; revenue_per_unit: number }>;
    hourly_sales_patterns?: Array<{ hour: number; sales: number }>;
    market_basket?: Array<{ product1: string; product2: string; frequency: number }>;
    // New Advanced Insights
    discount_analysis?: {
      total_discount?: number;
      avg_discount_per_order?: number;
      discount_pct_of_sales?: number;
      orders_with_discount?: number;
      discount_rate?: number;
      total_orders?: number;
      by_product?: Array<{ product: string; total_discount: number; avg_discount: number; order_count: number }>;
      monthly_trends?: Array<{ month: string; discount: number }>;
    };
    coupon_analysis?: Array<{ coupon_code: string; total_revenue: number; usage_count: number; avg_order_value: number; avg_discount: number }>;
    returns_analysis?: {
      total_returns?: number;
      return_rate?: number;
      returned_revenue?: number;
      returned_profit?: number;
      total_orders?: number;
      by_product?: Array<{ product: string; return_count: number; returned_revenue: number; return_rate: number }>;
      by_region?: Array<{ region: string; return_count: number; returned_revenue: number }>;
      monthly_trends?: Array<{ month: string; returns: number; orders: number; return_rate: number }>;
    };
    shipping_analysis?: {
      total_shipping?: number;
      avg_shipping_per_order?: number;
      shipping_pct_of_sales?: number;
      by_region?: Array<{ region: string; total_shipping: number; avg_shipping: number; order_count: number }>;
      by_product?: Array<{ product: string; total_shipping: number; avg_shipping: number }>;
    };
    tax_analysis?: {
      total_tax?: number;
      avg_tax_per_order?: number;
      tax_pct_of_sales?: number;
      by_region?: Array<{ region: string; total_tax: number; avg_tax: number }>;
    };
    order_analysis?: {
      total_orders?: number;
      avg_order_value?: number;
      avg_items_per_order?: number;
      order_value_distribution?: {
        min: number;
        max: number;
        median: number;
        q25: number;
        q75: number;
      };
      customer_order_frequency?: any;
    };
    sku_analysis?: Array<{ sku: string; total_sales: number; total_profit: number; total_quantity: number; profit_margin: number; avg_price: number }>;
    warehouse_analysis?: Array<{ warehouse: string; total_sales: number; total_profit: number; orders_fulfilled: number; total_shipping: number; profit_margin: number; avg_order_value: number }>;
    financial_health?: {
      gross_revenue?: number;
      net_revenue?: number;
      total_costs?: number;
      gross_profit?: number;
      net_profit?: number;
      net_profit_margin?: number;
      total_discounts?: number;
      returned_revenue?: number;
      total_shipping?: number;
      total_tax?: number;
    };
    // Additional Advanced Insights
    customer_purchase_frequency?: {
      avg_days_between_orders?: number;
      median_days_between_orders?: number;
      min_days?: number;
      max_days?: number;
      customers_with_multiple_orders?: number;
      frequency_distribution?: { [key: string]: number };
    };
    product_velocity?: Array<{ product: string; total_quantity: number; total_sales: number; velocity_per_day: number; velocity_per_week: number; velocity_category: string }>;
    cross_sell_opportunities?: Array<{ product1: string; product2: string; frequency: number }>;
    upsell_opportunities?: Array<{ target_product: string; potential_customers: number; avg_product_value: number }>;
    customer_value_segments?: {
      high_value?: { customer_count: number; total_revenue: number; revenue_pct: number; avg_revenue_per_customer: number };
      medium_value?: { customer_count: number; total_revenue: number; revenue_pct: number; avg_revenue_per_customer: number };
      low_value?: { customer_count: number; total_revenue: number; revenue_pct: number; avg_revenue_per_customer: number };
    };
    discount_roi_analysis?: {
      avg_order_value_with_discount?: number;
      avg_order_value_without_discount?: number;
      revenue_lift?: number;
      avg_discount_amount?: number;
      discount_roi_pct?: number;
      is_effective?: boolean;
    };
    churn_analysis?: {
      active_customers?: number;
      at_risk_customers?: number;
      churned_customers?: number;
      total_customers?: number;
      churn_rate?: number;
      at_risk_rate?: number;
    };
    seasonal_patterns?: {
      quarterly?: Array<{ quarter: string; sales: number }>;
      day_of_month?: Array<{ period: string; sales: number }>;
    };
    clv_by_cohort?: Array<{ cohort: string; total_revenue: number; customer_count: number; avg_clv: number }>;
    payment_impact_analysis?: {
      by_payment_method?: Array<{ payment_method: string; avg_order_value: number; order_count: number; total_revenue: number; return_rate?: number }>;
      highest_avg_order_value?: string;
      lowest_return_rate?: string;
    };
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
  userTier = 'free',
  insights = {},
  charts = {},
  loading = false,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  useEffect(() => {
    console.log("Insights prop:", insights);
  }, [insights]);

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
  // Use backend forecast values if available, otherwise calculate from trend
  const backendForecast = insights.forecast || {};
  
  // Parse backend forecast strings to extract numeric values
  const parseForecastValue = (forecastStr: string | undefined): number => {
    if (!forecastStr || forecastStr === "Data unavailable") return 0;
    // Extract number from strings like "$10,877.00 (next 7 days)"
    const match = forecastStr.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  };

  const shortTermFromBackend = parseForecastValue(backendForecast.short_term_sales);
  const monthlyFromBackend = parseForecastValue(backendForecast.monthly_sales);
  
  // Fallback to calculating from trend if backend values not available
  const totalForecast7Days = shortTermFromBackend > 0 
    ? shortTermFromBackend
    : computedForecastTrend.slice(0, 7).reduce((sum, item) => sum + item.value, 0);
  
  const totalForecast30Days = monthlyFromBackend > 0
    ? monthlyFromBackend
    : computedForecastTrend.reduce((sum, item) => sum + item.value, 0);

  // ---------- Customer Growth ----------
  const customerGrowthFromBackend = backendForecast.customer_growth;
  const customerGrowthPrediction = customerGrowthFromBackend 
    ? customerGrowthFromBackend
    : `+${Number(salesGrowth).toFixed(2)}% (next month)`;

  const inventoryDemandFromBackend = backendForecast.inventory_demand;
  const computedForecast = {
    short_term_sales:
      totalForecast7Days > 0
        ? `$${totalForecast7Days.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (next 7 days)`
        : backendForecast.short_term_sales || "Data unavailable",
    monthly_sales:
      totalForecast30Days > 0
        ? `$${totalForecast30Days.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (next month)`
        : backendForecast.monthly_sales || "Data unavailable",
    customer_growth: customerGrowthPrediction,
    inventory_demand:
      inventoryDemandFromBackend || (totalForecast30Days > 0
        ? `${Math.round(totalForecast30Days / 10)} units (next 30 days)`
        : "Data unavailable"),
  };

  return (
    <>
    <section className={`${glassmorphismClass} p-6 flex flex-col space-y-6 relative`} style={{ boxShadow: colors.cardShadow }}>
      <h2 className={`text-xl font-semibold ${colors.text}`}>
        🧠 Insights & Metrics
      </h2>

      <KpiCards
        totalProfit={totalProfit}
        totalSales={totalSales}
        totalCustomerCount={totalOrders}
        mostSoldProduct={topProduct}
        leastSoldProduct={insights.least_sold_product || "N/A"}
        growthRate={salesGrowth}
        avgOrderValue={insights.avg_order_value || 0}
        profitMarginPct={insights.profit_margin_pct || 0}
        avgProfitPerOrder={insights.avg_profit_per_order || 0}
        salesVelocity={insights.sales_velocity || 0}
        uniqueProductsCount={insights.unique_products_count || 0}
      />

      {/* Charts - Sales/Forecast and Profit Trend stacked vertically, full width */}
      <div className="space-y-6">
        <ForecastChart
          salesTrend={salesTrend}
          forecastTrend={computedForecastTrend}
        />

        {/* Profit Trend Chart - only for startup, business, enterprise */}
        {profitTrend.length > 0 && (userTier === 'startup' || userTier === 'business' || userTier === 'enterprise') && (
          <div className={`${glassmorphismClass} p-4 rounded-xl w-full`} style={{ boxShadow: colors.cardShadow }}>
            <h2 className={`text-xl font-semibold ${colors.text} mb-2`}>
              <span className="material-icons align-middle mr-2">show_chart</span>
              Profit Trend
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={profitTrend}>
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors.isDark ? "#4ade80" : "#16a34a"}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Advanced Insights Section - only for startup, business, enterprise */}
      {(userTier === 'startup' || userTier === 'business' || userTier === 'enterprise') && (
        <AdvancedInsights insights={insights} userTier={userTier} />
      )}

      {/* AI-Powered Insights Panel - conditional based on tier */}
      {hasFeatureAccess(userTier as PricingTier, 'ai_recommendations_3') && (
        <AIInsightsPanel
          aiRecommendations={insights.ai_recommendations}
          aiOpportunities={insights.ai_opportunities}
          aiRisks={insights.ai_risks}
          aiAnomalies={insights.ai_anomalies}
        />
      )}

      {/* Forecast Cards - only for startup, business, enterprise */}
      {(userTier === 'startup' || userTier === 'business' || userTier === 'enterprise') && (
        <ForecastCards forecast={computedForecast} />
      )}
    </section>
    </>
  );
};

// Wrap with fragment and add marquee
const InsightsPanelWithMarquee: React.FC<InsightsPanelProps> = (props) => {
  return (
    <div className="relative">
      <InsightsPanel {...props} />
      {/* Sticky Marquee at Bottom of Insights Section - positioned relative to content area */}
      <div className="sticky bottom-0 z-40 -mr-6 -mb-6">
        <InsightsMarquee
          alerts={props.insights?.alerts}
          aiRecommendations={props.insights?.ai_recommendations}
          text={props.insights?.text}
        />
      </div>
    </div>
  );
};

export default InsightsPanelWithMarquee;
