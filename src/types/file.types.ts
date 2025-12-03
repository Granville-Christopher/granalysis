export interface FileInsights {
  caption?: string;
  charts?: any;
  preview?: any;
  insights?: {
    // Old fields
    total?: number;
    weekly_estimate?: number;
    average_score?: number;
    avg?: number;
    min?: number;
    max?: number;
    columns?: string[];
    rows?: number;
    summary?: any;

    // New fields for e-commerce insights
    total_sales?: number;
    total_orders?: number;
    total_profit?: number;
    top_product?: string;
    least_sold_product?: string;
    top_3?: Array<{ product_name: string; quantity?: number; sales?: number }>;
    sales_growth?: number;
    growth_rate?: number;
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
    sales_trend?: Array<{ label: string; value: number }>;
    profit_trend?: Array<{ label: string; value: number }>;
    daily_profit_trend?: Array<{ label: string; value: number }>;
    forecast_trend?: Array<{ label: string; value: number }>;
    forecast?: {
      short_term_sales?: string;
      monthly_sales?: string;
      customer_growth?: string;
      inventory_demand?: string;
      sales_growth?: number;
      profit_growth?: number;
      customer_growth_prediction?: number;
      growth_status?: string;
    };
    text?: string;
    alerts?: string[];
    ai_recommendations?: string[];
    ai_opportunities?: string[];
    ai_risks?: string[];
    ai_anomalies?: string[];
    // Enterprise Insights
    rfm_analysis?: Array<{ customer: string; recency: number; frequency: number; monetary: number; segment: string }>;
    rfm_segments?: { [key: string]: number };
    clv_data?: Array<{ customer: string; clv: number; avg_order_value: number; purchase_frequency: number }>;
    avg_clv?: number;
    market_basket?: Array<{ product1: string; product2: string; frequency: number }>;
    basket_size?: number;
    cohort_data?: Array<{ cohort: string; period: number; customers: number; retention_rate: number }>;
    inventory_turnover?: number;
    days_of_inventory?: number;
    roi_by_product?: Array<{ [key: string]: any; roi_pct: number }>;
    avg_roi?: number;
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
      monthly?: Array<{ month: number; sales: number; month_name: string }>;
      quarterly?: Array<{ quarter: number; sales: number }>;
      day_of_week?: Array<{ day: string; sales: number }>;
      day_of_month?: Array<{ day: number; sales: number }>;
    };
    clv_by_cohort?: Array<{ cohort: string; total_revenue: number; customer_count: number; avg_clv: number }>;
    payment_impact_analysis?: {
      by_payment_method?: Array<{ payment_method: string; avg_order_value: number; order_count: number; total_revenue: number; return_rate?: number }>;
      highest_avg_order_value?: string;
      lowest_return_rate?: string;
    };
    // Enterprise-Level Insights
    executive_summary?: any;
    predictive_forecast_with_ci?: any;
    scenario_planning?: any;
    price_elasticity_analysis?: any;
    cash_flow_forecast?: any;
    revenue_attribution?: any;
    market_opportunity_scoring?: any;
    predictive_churn_analysis?: any;
    inventory_optimization?: any;
    break_even_analysis?: any;
    customer_journey_mapping?: any;
    next_best_actions?: any;
    advanced_anomaly_detection?: any;
    competitive_positioning?: any;
    profit_margin_optimization?: any;
  };
}

export interface FileMetadata {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: string;
}