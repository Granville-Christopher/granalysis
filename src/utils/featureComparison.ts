export type PricingTier = 'free' | 'startup' | 'business' | 'enterprise';

export interface FeatureRow {
  category: string;
  feature: string;
  free: boolean | string;
  startup: boolean | string;
  business: boolean | string;
  enterprise: boolean | string;
}

export const featureComparison: FeatureRow[] = [
  // Limits
  { category: 'Limits', feature: 'Files per month', free: '1', startup: '5', business: '15', enterprise: 'Unlimited' },
  { category: 'Limits', feature: 'Rows per file', free: '100', startup: '500', business: '1,000', enterprise: 'Unlimited' },
  
  // Basic Features
  { category: 'Basic Features', feature: 'Basic KPIs (Sales, Profit, Orders)', free: true, startup: true, business: true, enterprise: true },
  { category: 'Basic Features', feature: 'Sales Trend Chart (7 days)', free: true, startup: false, business: false, enterprise: false },
  { category: 'Basic Features', feature: 'Sales Trend Chart (30 days)', free: false, startup: true, business: true, enterprise: true },
  { category: 'Basic Features', feature: 'Profit Trend Chart', free: false, startup: true, business: true, enterprise: true },
  { category: 'Basic Features', feature: 'Top Products (3 products)', free: true, startup: false, business: false, enterprise: false },
  { category: 'Basic Features', feature: 'Top Products (5 products)', free: false, startup: true, business: false, enterprise: false },
  { category: 'Basic Features', feature: 'Top Products (10 products)', free: false, startup: false, business: true, enterprise: true },
  { category: 'Basic Features', feature: 'Top Customer (1 customer)', free: true, startup: false, business: false, enterprise: false },
  { category: 'Basic Features', feature: 'Top Customers (3 customers)', free: false, startup: true, business: false, enterprise: false },
  { category: 'Basic Features', feature: 'Top Customers (10 customers)', free: false, startup: false, business: true, enterprise: true },
  
  // Forecasting
  { category: 'Forecasting', feature: '7-Day Sales Forecast', free: false, startup: true, business: true, enterprise: true },
  { category: 'Forecasting', feature: '30-Day Sales Forecast', free: false, startup: false, business: true, enterprise: true },
  { category: 'Forecasting', feature: 'Customer Growth Forecast', free: false, startup: false, business: true, enterprise: true },
  { category: 'Forecasting', feature: 'Inventory Demand Forecast', free: false, startup: false, business: true, enterprise: true },
  
  // Customer Analytics
  { category: 'Customer Analytics', feature: 'Customer Analytics (Basic)', free: false, startup: true, business: true, enterprise: true },
  { category: 'Customer Analytics', feature: 'Customer Analytics (Charts)', free: false, startup: false, business: true, enterprise: true },
  { category: 'Customer Analytics', feature: 'RFM Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Customer Analytics', feature: 'Customer Lifetime Value (CLV)', free: false, startup: false, business: true, enterprise: true },
  { category: 'Customer Analytics', feature: 'Customer Value Segments', free: false, startup: false, business: true, enterprise: true },
  { category: 'Customer Analytics', feature: 'Market Basket Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Customer Analytics', feature: 'Cohort Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Customer Analytics', feature: 'Churn Prediction', free: false, startup: false, business: false, enterprise: true },
  { category: 'Customer Analytics', feature: 'Customer Acquisition Trends', free: false, startup: false, business: true, enterprise: true },
  
  // Product Analytics
  { category: 'Product Analytics', feature: 'Product Profitability Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Product Analytics', feature: 'Product Performance Matrix', free: false, startup: false, business: true, enterprise: true },
  { category: 'Product Analytics', feature: 'Product Lifecycle Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Product Analytics', feature: 'Product Velocity & Turnover', free: false, startup: false, business: false, enterprise: true },
  
  // Regional & Sales Analytics
  { category: 'Regional & Sales', feature: 'Regional Performance (Top 3)', free: false, startup: true, business: false, enterprise: false },
  { category: 'Regional & Sales', feature: 'Regional Performance (Full)', free: false, startup: false, business: true, enterprise: true },
  { category: 'Regional & Sales', feature: 'Regional Profit Comparison', free: false, startup: false, business: true, enterprise: true },
  { category: 'Regional & Sales', feature: 'Monthly Trends (6 months)', free: false, startup: true, business: false, enterprise: false },
  { category: 'Regional & Sales', feature: 'Monthly Trends (Full)', free: false, startup: false, business: true, enterprise: true },
  { category: 'Regional & Sales', feature: 'Day of Week Performance', free: false, startup: false, business: true, enterprise: true },
  { category: 'Regional & Sales', feature: 'Seasonal Patterns', free: false, startup: false, business: false, enterprise: true },
  { category: 'Regional & Sales', feature: 'Hourly Sales Patterns', free: false, startup: false, business: true, enterprise: true },
  
  // Payment & Financial
  { category: 'Payment & Financial', feature: 'Payment Method Analysis', free: false, startup: true, business: true, enterprise: true },
  { category: 'Payment & Financial', feature: 'Payment Impact Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Payment & Financial', feature: 'Discount Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Payment & Financial', feature: 'Discount ROI Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Payment & Financial', feature: 'Coupon Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Payment & Financial', feature: 'Financial Health Metrics', free: false, startup: false, business: false, enterprise: true },
  
  // Operational Insights
  { category: 'Operational', feature: 'Returns Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Operational', feature: 'Shipping Cost Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Operational', feature: 'Tax Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Operational', feature: 'Order-Level Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Operational', feature: 'SKU-Level Analysis', free: false, startup: false, business: false, enterprise: true },
  { category: 'Operational', feature: 'Warehouse Performance', free: false, startup: false, business: false, enterprise: true },
  { category: 'Operational', feature: 'Inventory Metrics', free: false, startup: false, business: false, enterprise: true },
  
  // AI Features
  { category: 'AI Features', feature: 'AI Text Summary (1 insight)', free: true, startup: false, business: false, enterprise: false },
  { category: 'AI Features', feature: 'AI Recommendations (3 max)', free: false, startup: true, business: false, enterprise: false },
  { category: 'AI Features', feature: 'AI Recommendations (Unlimited)', free: false, startup: false, business: true, enterprise: true },
  { category: 'AI Features', feature: 'AI Opportunities', free: false, startup: false, business: true, enterprise: true },
  { category: 'AI Features', feature: 'AI Risks & Anomalies', free: false, startup: false, business: false, enterprise: true },
  
  // Advanced Analytics
  { category: 'Advanced Analytics', feature: 'Cross-Sell Opportunities', free: false, startup: false, business: false, enterprise: true },
  { category: 'Advanced Analytics', feature: 'Upsell Opportunities', free: false, startup: false, business: false, enterprise: true },
  { category: 'Advanced Analytics', feature: 'Quantity vs Revenue Analysis', free: false, startup: false, business: true, enterprise: true },
  { category: 'Advanced Analytics', feature: 'Price Range Distribution', free: false, startup: false, business: true, enterprise: true },
  { category: 'Advanced Analytics', feature: 'Revenue Concentration Analysis', free: false, startup: false, business: true, enterprise: true },
  
  // Data Access
  { category: 'Data Access', feature: 'Data Table Preview', free: '100 rows', startup: '500 rows', business: 'Full access', enterprise: 'Full access' },
  { category: 'Data Access', feature: 'Export to CSV', free: false, startup: true, business: true, enterprise: true },
  { category: 'Data Access', feature: 'Export to Excel', free: false, startup: false, business: true, enterprise: true },
  { category: 'Data Access', feature: 'Export to PDF', free: false, startup: false, business: true, enterprise: true },
  { category: 'Data Access', feature: 'Export to JSON/API', free: false, startup: false, business: false, enterprise: true },
  
  // Integrations
  { category: 'Integrations', feature: 'Database Linking', free: false, startup: false, business: false, enterprise: true },
  { category: 'Integrations', feature: 'Real-time Data Sync', free: false, startup: false, business: false, enterprise: true },
  { category: 'Integrations', feature: 'API Access', free: false, startup: false, business: false, enterprise: true },
  { category: 'Integrations', feature: 'Custom Integrations', free: false, startup: false, business: false, enterprise: true },
  
  // Collaboration
  { category: 'Collaboration', feature: 'Team Dashboards', free: false, startup: false, business: false, enterprise: true },
  { category: 'Collaboration', feature: 'Team Sharing', free: false, startup: false, business: false, enterprise: true },
  { category: 'Collaboration', feature: 'Team Members', free: '1', startup: '1', business: '1', enterprise: 'Unlimited' },
  
  // Support
  { category: 'Support', feature: 'Email Support', free: true, startup: false, business: false, enterprise: false },
  { category: 'Support', feature: 'Priority Support', free: false, startup: true, business: false, enterprise: false },
  { category: 'Support', feature: 'Dedicated Account Manager', free: false, startup: false, business: true, enterprise: false },
  { category: 'Support', feature: '24/7 Premium Support', free: false, startup: false, business: false, enterprise: true },
  { category: 'Support', feature: 'SLA Guarantees', free: false, startup: false, business: false, enterprise: true },
];

