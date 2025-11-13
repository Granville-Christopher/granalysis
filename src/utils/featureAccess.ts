import { PricingTier } from './pricingTiers';

// Re-export PricingTier for convenience
export { type PricingTier };

/**
 * Check if a user's tier has access to a specific feature
 */
export const hasFeatureAccess = (tier: PricingTier, feature: string): boolean => {
  const tierFeatures: Record<PricingTier, Set<string>> = {
    free: new Set([
      'basic_kpis',
      'sales_trend_7d',
      'top_products_3',
      'top_customer_1',
      'ai_summary_1',
      'data_table_100',
    ]),
    startup: new Set([
      'basic_kpis',
      'sales_trend_30d',
      'profit_trend',
      'top_products_5',
      'top_customers_3',
      'forecast_7d',
      'customer_analytics_basic',
      'regional_performance_3',
      'monthly_trends_6m',
      'payment_method_analysis',
      'ai_recommendations_3',
      'export_csv',
      'data_table_500',
    ]),
    business: new Set([
      'basic_kpis',
      'sales_trend_30d',
      'profit_trend',
      'top_products_10',
      'top_customers_10',
      'forecast_7d',
      'forecast_30d',
      'customer_growth_forecast',
      'customer_analytics_full',
      'rfm_analysis',
      'clv_analysis',
      'customer_value_segments',
      'customer_acquisition_trends',
      'product_profitability',
      'product_performance_matrix',
      'product_lifecycle',
      'regional_performance_full',
      'regional_profit_comparison',
      'monthly_trends_full',
      'day_of_week_performance',
      'hourly_patterns',
      'payment_method_analysis',
      'discount_analysis',
      'coupon_analysis',
      'returns_analysis',
      'quantity_vs_revenue',
      'price_range_distribution',
      'revenue_concentration',
      'ai_recommendations_unlimited',
      'ai_opportunities',
      'export_csv',
      'export_excel',
      'export_pdf',
      'data_table_full',
    ]),
    enterprise: new Set([
      // Enterprise has access to everything
      'all',
    ]),
  };

  // Enterprise tier has access to everything
  if (tier === 'enterprise') {
    return true;
  }

  return tierFeatures[tier]?.has(feature) || false;
};

/**
 * Get the limit for a specific feature based on tier
 */
export const getFeatureLimit = (tier: PricingTier, feature: string): number | 'unlimited' => {
  const limits: Record<PricingTier, Record<string, number | 'unlimited'>> = {
    free: {
      top_products: 3,
      top_customers: 1,
      sales_trend_days: 7,
      ai_recommendations: 1,
      data_table_rows: 100,
      monthly_trends_months: 6,
      regional_performance: 3,
    },
    startup: {
      top_products: 5,
      top_customers: 3,
      sales_trend_days: 30,
      ai_recommendations: 3,
      data_table_rows: 500,
      monthly_trends_months: 6,
      regional_performance: 3,
    },
    business: {
      top_products: 10,
      top_customers: 10,
      sales_trend_days: 30,
      ai_recommendations: 'unlimited',
      data_table_rows: 'unlimited',
      monthly_trends_months: 'unlimited',
      regional_performance: 'unlimited',
    },
    enterprise: {
      top_products: 'unlimited',
      top_customers: 'unlimited',
      sales_trend_days: 'unlimited',
      ai_recommendations: 'unlimited',
      data_table_rows: 'unlimited',
      monthly_trends_months: 'unlimited',
      regional_performance: 'unlimited',
    },
  };

  return limits[tier]?.[feature] || 0;
};

/**
 * Check if a specific insight should be shown based on tier
 */
export const shouldShowInsight = (tier: PricingTier, insightName: string): boolean => {
  const insightMapping: Record<string, string> = {
    // Basic insights - available to all
    'total_sales': 'basic_kpis',
    'total_profit': 'basic_kpis',
    'total_orders': 'basic_kpis',
    'avg_order_value': 'basic_kpis',
    
    // Sales trends
    'sales_trend': tier === 'free' ? 'sales_trend_7d' : 'sales_trend_30d',
    'profit_trend': 'profit_trend',
    'forecast_trend': tier === 'free' ? '' : 'forecast_7d',
    
    // Top products
    'top_products': 'top_products',
    'product_margin_analysis': 'product_profitability',
    'product_performance_matrix': 'product_performance_matrix',
    'product_lifecycle': 'product_lifecycle',
    
    // Top customers
    'top_customer': 'top_customer_1',
    'top_customers_list': 'top_customers',
    'customer_analytics': tier === 'startup' ? 'customer_analytics_basic' : 'customer_analytics_full',
    'rfm_segments': 'rfm_analysis',
    'avg_clv': 'clv_analysis',
    'customer_value_segments': 'customer_value_segments',
    'customer_acquisition_trends': 'customer_acquisition_trends',
    
    // Regional
    'regional_performance': 'regional_performance',
    'regional_profit_comparison': 'regional_profit_comparison',
    
    // Trends
    'monthly_trends': 'monthly_trends',
    'day_of_week_performance': 'day_of_week_performance',
    'hourly_sales_patterns': 'hourly_patterns',
    'seasonal_patterns': 'seasonal_patterns',
    
    // Payment & Financial
    'payment_method_analysis': 'payment_method_analysis',
    'discount_analysis': 'discount_analysis',
    'coupon_analysis': 'coupon_analysis',
    'returns_analysis': 'returns_analysis',
    'financial_health': 'financial_health',
    
    // Advanced
    'quantity_vs_revenue': 'quantity_vs_revenue',
    'price_range_analysis': 'price_range_distribution',
    'market_basket': 'market_basket',
    'cross_sell_opportunities': 'cross_sell',
    'upsell_opportunities': 'upsell',
  };

  const requiredFeature = insightMapping[insightName];
  if (!requiredFeature) {
    // If not mapped, default to enterprise-only
    return tier === 'enterprise';
  }

  return hasFeatureAccess(tier, requiredFeature);
};

