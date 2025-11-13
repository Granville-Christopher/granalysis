import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, ComposedChart } from "recharts";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";
import { hasFeatureAccess, getFeatureLimit, PricingTier } from "../../utils/featureAccess";

interface AdditionalInsightsProps {
  userTier?: 'free' | 'startup' | 'business' | 'enterprise';
  insights?: {
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
    rfm_segments?: { [key: string]: number };
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const AdditionalInsights: React.FC<AdditionalInsightsProps> = ({ insights, userTier = 'free' }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  // Helper to limit data based on tier
  const limitData = <T,>(data: T[], limit: number | 'unlimited'): T[] => {
    if (limit === 'unlimited') return data;
    return data.slice(0, limit);
  };

  return (
    <div className="space-y-6">
      {/* Monthly Trends - only for startup, business, enterprise */}
      {insights?.monthly_trends && insights.monthly_trends.length > 0 && 
       (userTier === 'startup' || userTier === 'business' || userTier === 'enterprise') && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📅 Monthly Sales Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={(() => {
              const monthLimit = getFeatureLimit(userTier as PricingTier, 'monthly_trends_months');
              return limitData(insights.monthly_trends, monthLimit === 'unlimited' ? Infinity : (monthLimit as number));
            })()}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="month" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Line type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={2} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Customers by Revenue and Regional Profit Comparison - Side by Side - only for business and enterprise */}
      {((insights?.top_customers_list && insights.top_customers_list.length > 0) || 
       (insights?.regional_profit_comparison && insights.regional_profit_comparison.length > 0)) &&
       (userTier === 'business' || userTier === 'enterprise') ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers by Revenue */}
          {insights?.top_customers_list && insights.top_customers_list.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>
                👥 Top {(() => {
                  const customerLimit = getFeatureLimit(userTier as PricingTier, 'top_customers');
                  return customerLimit === 'unlimited' ? '10' : customerLimit;
                })()} Customers by Revenue
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={(() => {
                  const customerLimit = getFeatureLimit(userTier as PricingTier, 'top_customers');
                  return limitData(insights.top_customers_list, customerLimit === 'unlimited' ? 10 : (customerLimit as number));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis 
                    dataKey="customer" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 12 }}
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
                  <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Regional Profit Comparison */}
          {insights?.regional_profit_comparison && insights.regional_profit_comparison.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🌍 Regional Profit Comparison</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={insights.regional_profit_comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="region" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <YAxis yAxisId="left" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Profit Margin') return `${value.toFixed(2)}%`;
                      return `$${value.toLocaleString()}`;
                    }}
                  />
                  <Bar yAxisId="left" dataKey="total_sales" fill="#0088FE" name="Total Sales" />
                  <Bar yAxisId="left" dataKey="total_profit" fill="#00C49F" name="Total Profit" />
                  <Line yAxisId="right" type="monotone" dataKey="profit_margin" stroke="#FF8042" strokeWidth={2} name="Profit Margin %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      {/* Payment Method Analysis - only for startup, business, enterprise */}
      {insights?.payment_method_analysis && insights.payment_method_analysis.length > 0 && 
       (userTier === 'startup' || userTier === 'business' || userTier === 'enterprise') && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💳 Payment Method Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insights.payment_method_analysis}
                  dataKey="total_revenue"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.payment_method}: ${entry.percentage.toFixed(1)}%`}
                >
                  {insights.payment_method_analysis.map((entry, index) => (
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
            <div className="space-y-3">
              {insights.payment_method_analysis.map((method, index) => (
                <div key={index} className={`p-4 rounded-lg ${colors.isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-semibold ${colors.text}`}>{method.payment_method}</span>
                    <span className={`text-sm ${colors.textSecondary}`}>{method.percentage.toFixed(1)}%</span>
                  </div>
                  <div className={`text-sm ${colors.textSecondary}`}>
                    Revenue: ${method.total_revenue.toLocaleString()} | Transactions: {method.transaction_count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Products by Volume and Price Range Distribution - Side by Side */}
      {(insights?.top_products_by_volume && insights.top_products_by_volume.length > 0) || 
       (insights?.price_range_analysis && insights.price_range_analysis.length > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products by Volume */}
          {insights?.top_products_by_volume && insights.top_products_by_volume.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📦 Top 10 Products by Sales Volume</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={insights.top_products_by_volume}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis 
                    dataKey="product" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <Bar dataKey="quantity" fill="#FFBB28" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Price Range Analysis */}
          {insights?.price_range_analysis && insights.price_range_analysis.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💰 Price Range Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={insights.price_range_analysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="range" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <Bar dataKey="count" fill="#00C49F" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      {/* RFM Segments Visualization */}
      {insights?.rfm_segments && Object.keys(insights.rfm_segments).length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🎯 Customer RFM Segments</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(insights.rfm_segments).map(([segment, count]) => ({ segment, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis 
                  dataKey="segment" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 11 }}
                />
                <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: colors.isDark ? '#ffffff' : '#111827'
                  }}
                />
                <Bar dataKey="count" fill="#FF8042" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(insights.rfm_segments).map(([segment, count]) => ({ segment, count }))}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.segment}: ${entry.count}`}
                >
                  {Object.entries(insights.rfm_segments).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: colors.isDark ? '#ffffff' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      {/* Customer Acquisition Trends */}
      {insights?.customer_acquisition_trends && insights.customer_acquisition_trends.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📈 Customer Acquisition Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights.customer_acquisition_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="month" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
              />
              <Line type="monotone" dataKey="new_customers" stroke="#FF8042" strokeWidth={2} name="New Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Product Lifecycle */}
      {insights?.product_lifecycle && insights.product_lifecycle.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🔄 Product Lifecycle Stages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['New', 'Mature', 'Declining'].map((stage) => {
              const stageProducts = insights.product_lifecycle!.filter(p => p.stage === stage);
              const stageColors = {
                New: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400' },
                Mature: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400' },
                Declining: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400' }
              };
              const stageColor = stageColors[stage as keyof typeof stageColors];
              return (
                <div key={stage} className={`p-4 rounded-lg border-2 ${stageColor.border} ${stageColor.bg}`}>
                  <h4 className={`text-lg font-semibold mb-2 ${stageColor.text}`}>
                    {stage} ({stageProducts.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stageProducts.map((product, index) => (
                      <div key={index} className={`text-sm ${colors.textSecondary}`}>
                        <p className={colors.text}>{product.product}</p>
                        <p>Sales: ${product.total_sales.toLocaleString()} | Orders: {product.order_count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Quantity vs Revenue Analysis and Product Performance Matrix - Side by Side */}
      {(insights?.quantity_vs_revenue && insights.quantity_vs_revenue.length > 0) || 
       (insights?.product_performance_matrix && insights.product_performance_matrix.length > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quantity vs Revenue Analysis */}
          {insights?.quantity_vs_revenue && insights.quantity_vs_revenue.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📊 Quantity vs Revenue Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis 
                    type="number" 
                    dataKey="quantity" 
                    name="Quantity"
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                    label={{ value: 'Quantity Sold', position: 'insideBottom', offset: -5, fill: colors.isDark ? '#ffffff' : '#111827' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="revenue" 
                    name="Revenue"
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                    label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: colors.isDark ? '#ffffff' : '#111827' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Revenue') return `$${Number(value).toLocaleString()}`;
                      if (name === 'Revenue per Unit') return `$${Number(value).toFixed(2)}`;
                      return value;
                    }}
                    labelFormatter={(label) => `Product: ${label}`}
                  />
                  <Scatter 
                    name="Products" 
                    data={insights.quantity_vs_revenue} 
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Product Performance Matrix (Bubble Chart) */}
          {insights?.product_performance_matrix && insights.product_performance_matrix.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🎯 Product Performance Matrix</h3>
              <p className={`text-sm mb-4 ${colors.textSecondary}`}>
                Bubble size represents total profit. X-axis: Sales Volume, Y-axis: Profit Margin %
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis 
                    type="number" 
                    dataKey="sales_volume" 
                    name="Sales Volume"
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                    label={{ value: 'Sales Volume ($)', position: 'insideBottom', offset: -5, fill: colors.isDark ? '#ffffff' : '#111827' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="profit_margin" 
                    name="Profit Margin %"
                    tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                    label={{ value: 'Profit Margin (%)', angle: -90, position: 'insideLeft', fill: colors.isDark ? '#ffffff' : '#111827' }}
                  />
                  <ZAxis type="number" dataKey="total_profit" range={[50, 500]} name="Total Profit" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Sales Volume') return `$${Number(value).toLocaleString()}`;
                      if (name === 'Profit Margin %') return `${Number(value).toFixed(2)}%`;
                      if (name === 'Total Profit') return `$${Number(value).toLocaleString()}`;
                      return value;
                    }}
                    labelFormatter={(label) => `Product: ${label}`}
                  />
                  <Scatter 
                    name="Products" 
                    data={insights.product_performance_matrix} 
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      {/* Hourly Sales Patterns */}
      {insights?.hourly_sales_patterns && insights.hourly_sales_patterns.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>⏰ Hourly Sales Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights.hourly_sales_patterns}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis 
                dataKey="hour" 
                tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5, fill: colors.isDark ? '#ffffff' : '#111827' }}
              />
              <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelFormatter={(label) => `Hour: ${label}:00`}
              />
              <Bar dataKey="sales" fill="#FFBB28" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Market Basket Pairs */}
      {insights?.market_basket && insights.market_basket.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🛒 Frequently Bought Together</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.market_basket.slice(0, 10).map((pair, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${colors.isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${colors.text}`}>
                      {pair.product1} + {pair.product2}
                    </p>
                    <p className={`text-sm ${colors.textSecondary}`}>
                      Bought together {pair.frequency} time{pair.frequency !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className={`text-lg font-bold text-blue-500`}>
                    {pair.frequency}x
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Health Overview */}
      {insights?.financial_health && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💼 Financial Health Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Gross Revenue</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.financial_health.gross_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Net Revenue</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.financial_health.net_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-purple-900/30' : 'bg-purple-50'} border ${colors.isDark ? 'border-purple-700' : 'border-purple-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Net Profit</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.financial_health.net_profit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-orange-900/30' : 'bg-orange-50'} border ${colors.isDark ? 'border-orange-700' : 'border-orange-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Net Profit Margin</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.financial_health.net_profit_margin?.toFixed(2) || '0.00'}%
              </p>
            </div>
          </div>
          {(insights.financial_health.total_discounts || insights.financial_health.returned_revenue || insights.financial_health.total_costs) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.financial_health.total_discounts && (
                <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-red-900/20' : 'bg-red-50'} border ${colors.isDark ? 'border-red-700' : 'border-red-200'}`}>
                  <p className={`text-xs ${colors.textSecondary}`}>Total Discounts</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    ${insights.financial_health.total_discounts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {insights.financial_health.returned_revenue && (
                <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-red-900/20' : 'bg-red-50'} border ${colors.isDark ? 'border-red-700' : 'border-red-200'}`}>
                  <p className={`text-xs ${colors.textSecondary}`}>Returned Revenue</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    ${insights.financial_health.returned_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {insights.financial_health.total_costs && (
                <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${colors.isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
                  <p className={`text-xs ${colors.textSecondary}`}>Total Costs</p>
                  <p className={`text-lg font-semibold ${colors.text}`}>
                    ${insights.financial_health.total_costs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Discount & Coupon Analysis */}
      {insights?.discount_analysis && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💰 Discount & Coupon Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Total Discounts</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.discount_analysis.total_discount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.discount_analysis.discount_pct_of_sales?.toFixed(2) || '0.00'}% of sales
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Discount Rate</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.discount_analysis.discount_rate?.toFixed(2) || '0.00'}%
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.discount_analysis.orders_with_discount || 0} of {insights.discount_analysis.total_orders || 0} orders
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-purple-900/30' : 'bg-purple-50'} border ${colors.isDark ? 'border-purple-700' : 'border-purple-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Avg Discount/Order</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.discount_analysis.avg_discount_per_order?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
          </div>
          {insights.discount_analysis.by_product && insights.discount_analysis.by_product.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>Top Products by Discount</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.discount_analysis.by_product.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="product" tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="total_discount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Returns Analysis */}
      {insights?.returns_analysis && insights.returns_analysis.total_returns && insights.returns_analysis.total_returns > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>↩️ Returns Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-red-900/30' : 'bg-red-50'} border ${colors.isDark ? 'border-red-700' : 'border-red-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Return Rate</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.returns_analysis.return_rate?.toFixed(2) || '0.00'}%
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.returns_analysis.total_returns || 0} returns
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-orange-900/30' : 'bg-orange-50'} border ${colors.isDark ? 'border-orange-700' : 'border-orange-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Returned Revenue</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.returns_analysis.returned_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${colors.isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Returned Profit</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.returns_analysis.returned_profit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
          </div>
          {insights.returns_analysis.by_product && insights.returns_analysis.by_product.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>Top Products by Returns</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.returns_analysis.by_product.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="product" tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <Bar dataKey="return_count" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Shipping & Tax Analysis */}
      {(insights?.shipping_analysis || insights?.tax_analysis) && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🚚 Shipping & Tax Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.shipping_analysis && (
              <>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                  <p className={`text-sm ${colors.textSecondary}`}>Total Shipping</p>
                  <p className={`text-2xl font-bold ${colors.text}`}>
                    ${insights.shipping_analysis.total_shipping?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                    {insights.shipping_analysis.shipping_pct_of_sales?.toFixed(2) || '0.00'}% of sales
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
                  <p className={`text-sm ${colors.textSecondary}`}>Avg Shipping/Order</p>
                  <p className={`text-2xl font-bold ${colors.text}`}>
                    ${insights.shipping_analysis.avg_shipping_per_order?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </>
            )}
            {insights.tax_analysis && (
              <>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-purple-900/30' : 'bg-purple-50'} border ${colors.isDark ? 'border-purple-700' : 'border-purple-200'}`}>
                  <p className={`text-sm ${colors.textSecondary}`}>Total Tax</p>
                  <p className={`text-2xl font-bold ${colors.text}`}>
                    ${insights.tax_analysis.total_tax?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                    {insights.tax_analysis.tax_pct_of_sales?.toFixed(2) || '0.00'}% of sales
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-orange-900/30' : 'bg-orange-50'} border ${colors.isDark ? 'border-orange-700' : 'border-orange-200'}`}>
                  <p className={`text-sm ${colors.textSecondary}`}>Avg Tax/Order</p>
                  <p className={`text-2xl font-bold ${colors.text}`}>
                    ${insights.tax_analysis.avg_tax_per_order?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Analysis */}
      {insights?.order_analysis && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📦 Order Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Total Unique Orders</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.order_analysis.total_orders?.toLocaleString() || '0'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Avg Order Value</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.order_analysis.avg_order_value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-purple-900/30' : 'bg-purple-50'} border ${colors.isDark ? 'border-purple-700' : 'border-purple-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Avg Items/Order</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.order_analysis.avg_items_per_order?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          {insights.order_analysis.order_value_distribution && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${colors.textSecondary}`}>Min</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  ${insights.order_analysis.order_value_distribution.min?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${colors.textSecondary}`}>Q25</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  ${insights.order_analysis.order_value_distribution.q25?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${colors.textSecondary}`}>Median</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  ${insights.order_analysis.order_value_distribution.median?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${colors.textSecondary}`}>Q75</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  ${insights.order_analysis.order_value_distribution.q75?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${colors.textSecondary}`}>Max</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  ${insights.order_analysis.order_value_distribution.max?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SKU Analysis */}
      {insights?.sku_analysis && insights.sku_analysis.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🏷️ Top SKUs by Sales</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={insights.sku_analysis.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="sku" tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 10 }} angle={-45} textAnchor="end" height={120} />
              <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
              <Bar dataKey="total_sales" fill="#8884d8" name="Total Sales" />
              <Bar dataKey="total_profit" fill="#82ca9d" name="Total Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Coupon Analysis */}
      {insights?.coupon_analysis && insights.coupon_analysis.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🎫 Top Coupons by Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.coupon_analysis.slice(0, 9).map((coupon, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${colors.isDark ? 'bg-[#1A345B] border-white/10' : 'bg-white border-gray-200'}`} style={colors.isDark ? { backgroundColor: 'rgba(26, 52, 91, 0.6)', backdropFilter: 'blur(10px)' } : {}}>
                <p className={`font-semibold ${colors.text}`}>{coupon.coupon_code || 'N/A'}</p>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>
                  Used {coupon.usage_count} time{coupon.usage_count !== 1 ? 's' : ''}
                </p>
                <p className={`text-lg font-bold text-blue-500 mt-2`}>
                  ${coupon.total_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
                <p className={`text-xs ${colors.textSecondary} mt-1`}>
                  Avg: ${coupon.avg_order_value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Purchase Frequency */}
      {insights?.customer_purchase_frequency && Object.keys(insights.customer_purchase_frequency).length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📅 Customer Purchase Frequency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Avg Days Between Orders</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.customer_purchase_frequency.avg_days_between_orders?.toFixed(1) || '0'} days
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Median Days</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.customer_purchase_frequency.median_days_between_orders?.toFixed(1) || '0'} days
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-purple-900/30' : 'bg-purple-50'} border ${colors.isDark ? 'border-purple-700' : 'border-purple-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Repeat Customers</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.customer_purchase_frequency.customers_with_multiple_orders || 0}
              </p>
            </div>
          </div>
          {insights.customer_purchase_frequency.frequency_distribution && (
            <div>
              <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>Frequency Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(insights.customer_purchase_frequency.frequency_distribution).map(([key, value]) => ({ period: key, count: value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="period" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Product Velocity */}
      {insights?.product_velocity && insights.product_velocity.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>⚡ Product Velocity (Units per Day)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={insights.product_velocity.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="product" tick={{ fill: colors.isDark ? '#ffffff' : '#111827', fontSize: 10 }} angle={-45} textAnchor="end" height={120} />
              <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
              />
              <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
              <Bar dataKey="velocity_per_day" fill="#8884d8" name="Units/Day" />
              <Bar dataKey="velocity_per_week" fill="#82ca9d" name="Units/Week" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cross-Sell & Upsell Opportunities and Warehouse Performance in same row */}
      {(((insights?.cross_sell_opportunities && insights.cross_sell_opportunities.length > 0) || (insights?.upsell_opportunities && insights.upsell_opportunities.length > 0)) || (insights?.warehouse_analysis && insights.warehouse_analysis.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cross-Sell & Upsell Opportunities */}
          {((insights?.cross_sell_opportunities && insights.cross_sell_opportunities.length > 0) || (insights?.upsell_opportunities && insights.upsell_opportunities.length > 0)) && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🔄 Cross-Sell & Upsell Opportunities</h3>
              <div className="grid grid-cols-1 gap-6">
                {insights.cross_sell_opportunities && insights.cross_sell_opportunities.length > 0 && (
                  <div>
                    <h4 className={`text-lg font-semibold mb-3 ${colors.text}`}>Cross-Sell Opportunities</h4>
                    <div className="space-y-2">
                      {insights.cross_sell_opportunities.slice(0, 5).map((opp, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${colors.isDark ? 'bg-[#1A345B] border-white/10' : 'bg-white border-gray-200'}`} style={colors.isDark ? { backgroundColor: 'rgba(26, 52, 91, 0.6)', backdropFilter: 'blur(10px)' } : {}}>
                          <p className={`font-semibold ${colors.text}`}>
                            {opp.product1} + {opp.product2}
                          </p>
                          <p className={`text-sm ${colors.textSecondary}`}>
                            Bought together {opp.frequency} time{opp.frequency !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {insights.upsell_opportunities && insights.upsell_opportunities.length > 0 && (
                  <div>
                    <h4 className={`text-lg font-semibold mb-3 ${colors.text}`}>Upsell Opportunities</h4>
                    <div className="space-y-2">
                      {insights.upsell_opportunities.slice(0, 5).map((opp, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${colors.isDark ? 'bg-[#1A345B] border-white/10' : 'bg-white border-gray-200'}`} style={colors.isDark ? { backgroundColor: 'rgba(26, 52, 91, 0.6)', backdropFilter: 'blur(10px)' } : {}}>
                          <p className={`font-semibold ${colors.text}`}>{opp.target_product}</p>
                          <p className={`text-sm ${colors.textSecondary}`}>
                            {opp.potential_customers} potential customers
                          </p>
                          <p className={`text-sm font-semibold text-blue-500 mt-1`}>
                            Avg Value: ${opp.avg_product_value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Warehouse Performance */}
          {insights?.warehouse_analysis && insights.warehouse_analysis.length > 0 && (
            <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
              <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>🏭 Warehouse Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={insights.warehouse_analysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis dataKey="warehouse" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <YAxis yAxisId="left" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      color: colors.isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
                  <Bar yAxisId="left" dataKey="total_sales" fill="#8884d8" name="Total Sales" />
                  <Bar yAxisId="left" dataKey="total_profit" fill="#82ca9d" name="Total Profit" />
                  <Line yAxisId="right" type="monotone" dataKey="profit_margin" stroke="#ff7300" name="Profit Margin %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Customer Value Segments */}
      {insights?.customer_value_segments && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>👥 Customer Value Segmentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.customer_value_segments.high_value && (
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
                <p className={`text-sm font-semibold ${colors.text}`}>High Value (Top 20%)</p>
                <p className={`text-2xl font-bold ${colors.text} mt-2`}>
                  {insights.customer_value_segments.high_value.revenue_pct?.toFixed(1)}%
                </p>
                <p className={`text-xs ${colors.textSecondary} mt-1`}>
                  {insights.customer_value_segments.high_value.customer_count} customers
                </p>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>
                  ${insights.customer_value_segments.high_value.avg_revenue_per_customer?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} avg
                </p>
              </div>
            )}
            {insights.customer_value_segments.medium_value && (
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                <p className={`text-sm font-semibold ${colors.text}`}>Medium Value (Middle 60%)</p>
                <p className={`text-2xl font-bold ${colors.text} mt-2`}>
                  {insights.customer_value_segments.medium_value.revenue_pct?.toFixed(1)}%
                </p>
                <p className={`text-xs ${colors.textSecondary} mt-1`}>
                  {insights.customer_value_segments.medium_value.customer_count} customers
                </p>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>
                  ${insights.customer_value_segments.medium_value.avg_revenue_per_customer?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} avg
                </p>
              </div>
            )}
            {insights.customer_value_segments.low_value && (
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-orange-900/30' : 'bg-orange-50'} border ${colors.isDark ? 'border-orange-700' : 'border-orange-200'}`}>
                <p className={`text-sm font-semibold ${colors.text}`}>Low Value (Bottom 20%)</p>
                <p className={`text-2xl font-bold ${colors.text} mt-2`}>
                  {insights.customer_value_segments.low_value.revenue_pct?.toFixed(1)}%
                </p>
                <p className={`text-xs ${colors.textSecondary} mt-1`}>
                  {insights.customer_value_segments.low_value.customer_count} customers
                </p>
                <p className={`text-sm ${colors.textSecondary} mt-1`}>
                  ${insights.customer_value_segments.low_value.avg_revenue_per_customer?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} avg
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discount ROI Analysis */}
      {insights?.discount_roi_analysis && Object.keys(insights.discount_roi_analysis).length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💰 Discount ROI Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Avg Order (With Discount)</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.discount_roi_analysis.avg_order_value_with_discount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Avg Order (Without Discount)</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.discount_roi_analysis.avg_order_value_without_discount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-purple-900/30' : 'bg-purple-50'} border ${colors.isDark ? 'border-purple-700' : 'border-purple-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Revenue Lift</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                ${insights.discount_roi_analysis.revenue_lift?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${insights.discount_roi_analysis.is_effective ? (colors.isDark ? 'bg-green-900/30' : 'bg-green-50') : (colors.isDark ? 'bg-red-900/30' : 'bg-red-50')} border ${insights.discount_roi_analysis.is_effective ? (colors.isDark ? 'border-green-700' : 'border-green-200') : (colors.isDark ? 'border-red-700' : 'border-red-200')}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Discount ROI</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.discount_roi_analysis.discount_roi_pct?.toFixed(2) || '0.00'}%
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.discount_roi_analysis.is_effective ? '✅ Effective' : '❌ Not Effective'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Churn Analysis */}
      {insights?.churn_analysis && Object.keys(insights.churn_analysis).length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>⚠️ Customer Churn Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Active Customers</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.churn_analysis.active_customers?.toLocaleString() || '0'}
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.churn_analysis.total_customers ? ((insights.churn_analysis.active_customers || 0) / insights.churn_analysis.total_customers * 100).toFixed(1) : '0'}% of total
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${colors.isDark ? 'border-yellow-700' : 'border-yellow-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>At Risk</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.churn_analysis.at_risk_customers?.toLocaleString() || '0'}
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.churn_analysis.at_risk_rate?.toFixed(2) || '0.00'}% of total
              </p>
            </div>
            <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-red-900/30' : 'bg-red-50'} border ${colors.isDark ? 'border-red-700' : 'border-red-200'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Churned</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {insights.churn_analysis.churned_customers?.toLocaleString() || '0'}
              </p>
              <p className={`text-xs mt-1 ${colors.textSecondary}`}>
                {insights.churn_analysis.churn_rate?.toFixed(2) || '0.00'}% of total
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Patterns */}
      {insights?.seasonal_patterns && (insights.seasonal_patterns.quarterly || insights.seasonal_patterns.day_of_month) && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📅 Seasonal & Cyclical Patterns</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.seasonal_patterns.quarterly && insights.seasonal_patterns.quarterly.length > 0 && (
              <div>
                <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>Quarterly Sales</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insights.seasonal_patterns.quarterly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis dataKey="quarter" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                    <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: colors.isDark ? '#ffffff' : '#111827'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {insights.seasonal_patterns.day_of_month && insights.seasonal_patterns.day_of_month.length > 0 && (
              <div>
                <h4 className={`text-lg font-semibold mb-2 ${colors.text}`}>Day of Month Patterns</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insights.seasonal_patterns.day_of_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis dataKey="period" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                    <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        color: colors.isDark ? '#ffffff' : '#111827'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLV by Cohort */}
      {insights?.clv_by_cohort && insights.clv_by_cohort.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>📊 Customer Lifetime Value by Cohort</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={insights.clv_by_cohort}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="cohort" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <YAxis yAxisId="left" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
              />
              <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
              <Bar yAxisId="left" dataKey="total_revenue" fill="#8884d8" name="Total Revenue" />
              <Bar yAxisId="left" dataKey="customer_count" fill="#82ca9d" name="Customer Count" />
              <Line yAxisId="right" type="monotone" dataKey="avg_clv" stroke="#ff7300" name="Avg CLV" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payment Impact Analysis */}
      {insights?.payment_impact_analysis && insights.payment_impact_analysis.by_payment_method && insights.payment_impact_analysis.by_payment_method.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
          <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>💳 Payment Method Impact Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {insights.payment_impact_analysis.highest_avg_order_value && (
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-green-900/30' : 'bg-green-50'} border ${colors.isDark ? 'border-green-700' : 'border-green-200'}`}>
                <p className={`text-sm ${colors.textSecondary}`}>Highest Avg Order Value</p>
                <p className={`text-xl font-bold ${colors.text}`}>
                  {insights.payment_impact_analysis.highest_avg_order_value}
                </p>
              </div>
            )}
            {insights.payment_impact_analysis.lowest_return_rate && (
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${colors.isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                <p className={`text-sm ${colors.textSecondary}`}>Lowest Return Rate</p>
                <p className={`text-xl font-bold ${colors.text}`}>
                  {insights.payment_impact_analysis.lowest_return_rate}
                </p>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights.payment_impact_analysis.by_payment_method}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="payment_method" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <YAxis tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: colors.isDark ? '#ffffff' : '#111827'
                }}
              />
              <Legend wrapperStyle={{ color: colors.isDark ? '#ffffff' : '#111827' }} />
              <Bar dataKey="avg_order_value" fill="#8884d8" name="Avg Order Value" />
              {insights.payment_impact_analysis.by_payment_method[0]?.return_rate !== undefined && (
                <Bar dataKey="return_rate" fill="#ff6b6b" name="Return Rate %" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdditionalInsights;

