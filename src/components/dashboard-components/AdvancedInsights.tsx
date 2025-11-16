import React, { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";
import AdditionalInsights from "./AdditionalInsights";
import { hasFeatureAccess, getFeatureLimit, PricingTier } from "../../utils/featureAccess";

interface AdvancedInsightsProps {
  userTier?: 'free' | 'startup' | 'business' | 'enterprise';
  insights?: {
    most_profitable_product?: string;
    least_profitable_product?: string;
    product_margin_analysis?: Array<{ product_name: string; margin_pct: number; total_profit: number; total_sales: number }>;
    top_customer?: string;
    top_customer_revenue?: number;
    repeat_customer_rate?: number;
    unique_customers?: number;
    revenue_per_customer?: number;
    top_region?: string;
    regional_performance?: Array<{ region: string; total_sales: number; total_profit: number }>;
    peak_sales_day?: string;
    day_of_week_performance?: Array<{ day: string; sales: number }>;
    revenue_concentration_pct?: number;
    products_to_discontinue?: Array<{ product_name: string; total_sales: number; margin_pct: number }>;
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
}

const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({ insights, userTier = 'free' }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  // Debug: Log enterprise insights
  useEffect(() => {
    console.log("📊 Advanced Insights - Enterprise Metrics:", {
      avg_clv: insights?.avg_clv,
      basket_size: insights?.basket_size,
      inventory_turnover: insights?.inventory_turnover,
      days_of_inventory: insights?.days_of_inventory,
      avg_roi: insights?.avg_roi,
      rfm_segments: insights?.rfm_segments,
    });
  }, [insights?.avg_clv, insights?.basket_size, insights?.inventory_turnover, insights?.days_of_inventory, insights?.avg_roi, insights?.rfm_segments]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Customer Analytics Section */}
      {(insights?.top_customer || insights?.repeat_customer_rate !== undefined) && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>👥 Customer Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights?.top_customer && (
              <div 
                className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.35) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.5)'}`,
                  boxShadow: `0 8px 32px 0 ${isDark ? 'rgba(0, 0, 0, 0.37)' : 'rgba(0, 0, 0, 0.1)'}, inset 0 1px 0 0 ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'}`,
                }}
              >
                <p className={`text-sm ${isDark ? 'opacity-90' : 'opacity-80'}`}>Top Customer</p>
                <p className="text-lg font-bold mt-1 truncate" title={insights.top_customer}>
                  {insights.top_customer}
                </p>
                {insights.top_customer_revenue && (
                  <p className={`text-sm mt-1 ${isDark ? 'opacity-90' : 'opacity-80'}`}>${insights.top_customer_revenue.toLocaleString()}</p>
                )}
              </div>
            )}
            {insights?.repeat_customer_rate !== undefined && (
              <div 
                className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.35) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.5)'}`,
                  boxShadow: `0 8px 32px 0 ${isDark ? 'rgba(0, 0, 0, 0.37)' : 'rgba(0, 0, 0, 0.1)'}, inset 0 1px 0 0 ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'}`,
                }}
              >
                <p className={`text-sm ${isDark ? 'opacity-90' : 'opacity-80'}`}>Repeat Customer Rate</p>
                <p className="text-2xl font-bold mt-1">{insights.repeat_customer_rate.toFixed(1)}%</p>
              </div>
            )}
            {insights?.unique_customers !== undefined && (
              <div 
                className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.35) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.5)'}`,
                  boxShadow: `0 8px 32px 0 ${isDark ? 'rgba(0, 0, 0, 0.37)' : 'rgba(0, 0, 0, 0.1)'}, inset 0 1px 0 0 ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'}`,
                }}
              >
                <p className={`text-sm ${isDark ? 'opacity-90' : 'opacity-80'}`}>Unique Customers</p>
                <p className="text-2xl font-bold mt-1">{insights.unique_customers}</p>
              </div>
            )}
            {insights?.revenue_per_customer !== undefined && (
              <div 
                className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(79, 70, 229, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.35) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.5)'}`,
                  boxShadow: `0 8px 32px 0 ${isDark ? 'rgba(0, 0, 0, 0.37)' : 'rgba(0, 0, 0, 0.1)'}, inset 0 1px 0 0 ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'}`,
                }}
              >
                <p className={`text-sm ${isDark ? 'opacity-90' : 'opacity-80'}`}>Revenue per Customer</p>
                <p className="text-2xl font-bold mt-1">${insights.revenue_per_customer.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Profitability Section - Reduced width - only for business and enterprise */}
      {insights?.product_margin_analysis && insights.product_margin_analysis.length > 0 && 
       (userTier === 'business' || userTier === 'enterprise') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${glassmorphismClass} p-6 rounded-xl lg:col-span-2`} style={{ boxShadow: colors.cardShadow }}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💰 Product Profitability</h3>
            <div className="grid grid-cols-1 gap-6">
            <div>
              {(() => {
                const productLimit = getFeatureLimit(userTier as PricingTier, 'top_products');
                const limit = productLimit === 'unlimited' ? 10 : (productLimit as number);
                return (
                  <>
                    <h4 className={`text-sm font-medium mb-3 ${colors.textSecondary}`}>Top {limit} Most Profitable Products</h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={insights.product_margin_analysis.slice(0, limit)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis 
                    dataKey="product_name" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Bar dataKey="margin_pct" fill="#00C49F" name="Margin %" />
                </BarChart>
              </ResponsiveContainer>
                  </>
                );
              })()}
            </div>
            <div>
              <div className="space-y-3">
                {insights.most_profitable_product && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className={`text-sm ${colors.textSecondary}`}>Most Profitable</p>
                    <p className={`text-lg font-bold ${colors.text}`}>{insights.most_profitable_product}</p>
                  </div>
                )}
                {insights.least_profitable_product && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className={`text-sm ${colors.textSecondary}`}>Least Profitable</p>
                    <p className={`text-lg font-bold ${colors.text}`}>{insights.least_profitable_product}</p>
                  </div>
                )}
                {insights.revenue_concentration_pct !== undefined && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className={`text-sm ${colors.textSecondary}`}>Revenue Concentration</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>{insights.revenue_concentration_pct.toFixed(1)}%</p>
                    <p className={`text-xs mt-1 ${colors.textSecondary}`}>Top 20% of products generate this % of revenue</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
          {/* Additional Metrics Section */}
          <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
            <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>📊 Additional Metrics</h3>
            <div className="space-y-4">
              {insights.avg_clv !== undefined && insights.avg_clv > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className={`text-xs ${colors.textSecondary}`}>Average Customer Lifetime Value</p>
                  <p className={`text-xl font-bold ${colors.text}`}>${insights.avg_clv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              {insights.basket_size !== undefined && insights.basket_size > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className={`text-xs ${colors.textSecondary}`}>Average Basket Size</p>
                  <p className={`text-xl font-bold ${colors.text}`}>{insights.basket_size.toFixed(1)} items</p>
                </div>
              )}
              {insights.inventory_turnover !== undefined && insights.inventory_turnover > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className={`text-xs ${colors.textSecondary}`}>Inventory Turnover</p>
                  <p className={`text-xl font-bold ${colors.text}`}>{insights.inventory_turnover.toFixed(1)}x</p>
                  {insights.days_of_inventory !== undefined && insights.days_of_inventory > 0 && (
                    <p className={`text-xs mt-1 ${colors.textSecondary}`}>{insights.days_of_inventory.toFixed(1)} days</p>
                  )}
                </div>
              )}
              {insights.avg_roi !== undefined && insights.avg_roi > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className={`text-xs ${colors.textSecondary}`}>Average ROI</p>
                  <p className={`text-xl font-bold ${colors.text}`}>{insights.avg_roi.toFixed(1)}%</p>
                </div>
              )}
              {insights.rfm_segments && Object.keys(insights.rfm_segments).length > 0 && (
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <p className={`text-xs ${colors.textSecondary} mb-2`}>Customer Segments (RFM)</p>
                  <div className="space-y-1">
                    {Object.entries(insights.rfm_segments).slice(0, 3).map(([segment, count]) => (
                      <div key={segment} className="flex justify-between items-center">
                        <span className={`text-xs ${colors.text}`}>{segment}</span>
                        <span className={`text-sm font-semibold ${colors.text}`}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!insights.avg_clv || insights.avg_clv === 0) && 
               (!insights.basket_size || insights.basket_size === 0) && 
               (!insights.inventory_turnover || insights.inventory_turnover === 0) && 
               (!insights.avg_roi || insights.avg_roi === 0) && 
               (!insights.rfm_segments || Object.keys(insights.rfm_segments).length === 0) && (
                <p className={`text-sm ${colors.textSecondary} text-center py-4`}>Additional metrics will appear here when available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regional Performance and Day of Week Performance - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Performance - 1/3 width */}
        {insights?.regional_performance && insights.regional_performance.length > 0 && (() => {
          // Find the top region index to get its color
          const topRegionIndex = insights.regional_performance.findIndex(
            (r: any) => r.region === insights.top_region
          );
          const topRegionColor = topRegionIndex >= 0 
            ? COLORS[topRegionIndex % COLORS.length] 
            : COLORS[0];
          
          // Convert hex to rgba for glassmorphic effect
          const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };

          return (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>🌍 Regional Performance</h3>
              {insights.top_region && (
                <div 
                  className="p-4 rounded-lg mb-4 backdrop-blur-md border"
                  style={{
                    background: `linear-gradient(135deg, ${hexToRgba(topRegionColor, 0.2)} 0%, ${hexToRgba(topRegionColor, 0.1)} 100%)`,
                    borderColor: hexToRgba(topRegionColor, 0.3),
                    boxShadow: `0 4px 15px ${hexToRgba(topRegionColor, 0.2)}`,
                  }}
                >
                  <p className={`text-xs ${colors.textSecondary} mb-1`}>Top Region</p>
                  <p className={`text-xl font-bold ${colors.text}`}>{insights.top_region}</p>
                </div>
              )}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={insights.regional_performance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const percent = entry.percent || 0;
                      const region = entry.region || entry.payload?.region || '';
                      return `${region}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="total_sales"
                  >
                    {insights.regional_performance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Day of Week Performance - 2/3 width */}
        {insights?.day_of_week_performance && insights.day_of_week_performance.length > 0 && (
          <div className={`${glassmorphismClass} p-6 rounded-xl lg:col-span-2`} style={{ boxShadow: colors.cardShadow }}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📅 Day of Week Performance</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.peak_sales_day && (
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-lg">
                  <p className="text-sm opacity-90">Peak Sales Day</p>
                  <p className="text-3xl font-bold mt-2">{insights.peak_sales_day}</p>
                </div>
              )}
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={insights.day_of_week_performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                    />
                    <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: colors.isDark ? '#ffffff' : '#111827'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="sales" fill="#FF8042" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products to Discontinue */}
      {insights?.products_to_discontinue && insights.products_to_discontinue.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl border-2 border-red-200 dark:border-red-800`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 text-red-600 dark:text-red-400`}>⚠️ Products to Consider Discontinuing</h3>
          <p className={`text-sm mb-4 ${colors.textSecondary}`}>
            These products have low sales (bottom 25%) and low profit margins (&lt;10%)
          </p>
          <div className="space-y-2">
            {insights.products_to_discontinue.map((product, index) => (
              <div 
                key={index}
                className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${colors.text}`}>{product.product_name}</p>
                    <p className={`text-sm ${colors.textSecondary}`}>
                      Sales: ${product.total_sales.toLocaleString()} | Margin: {product.margin_pct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note: AdditionalInsights is now shown separately in InsightsPanel with category filters */}
    </div>
  );
};

export default AdvancedInsights;

