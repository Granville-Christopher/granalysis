import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";
import { X } from "lucide-react";
import { formatYAxisTick, formatTooltipValue } from "../../utils/numberFormatter";

interface EnterpriseInsightsProps {
  userTier?: 'free' | 'startup' | 'business' | 'enterprise';
  insights?: {
    predictive_forecast_with_ci?: {
      forecast?: Array<{ date: string; predicted: number; ci_80_lower: number; ci_80_upper: number; ci_95_lower: number; ci_95_upper: number }>;
      confidence_levels?: { [key: string]: string };
      std_error?: number;
    };
    scenario_planning?: {
      scenarios?: {
        optimistic?: { growth_multiplier: number; description: string; "30_day_forecast": number; "90_day_forecast": number; assumptions: string[] };
        realistic?: { growth_multiplier: number; description: string; "30_day_forecast": number; "90_day_forecast": number; assumptions: string[] };
        pessimistic?: { growth_multiplier: number; description: string; "30_day_forecast": number; "90_day_forecast": number; assumptions: string[] };
      };
      recommended_scenario?: string;
      risk_assessment?: string;
    };
    price_elasticity_analysis?: {
      elasticity_by_range?: Array<{ price_range: string; elasticity: number; interpretation: string; recommendation: string }>;
      overall_elasticity?: number;
      optimal_pricing_strategy?: string;
    };
    cash_flow_forecast?: {
      daily_cash_inflow?: number;
      daily_cash_outflow?: number;
      net_daily_cash_flow?: number;
      "30_day_forecast"?: { total_inflow: number; total_outflow: number; net_cash_flow: number; cumulative_balance: number };
      payment_terms_assumption?: string;
      risk_factors?: string[];
    };
    revenue_attribution?: {
      attribution_sources?: {
        by_product?: Array<{ source: string; revenue: number; percentage: number }>;
        by_region?: Array<{ source: string; revenue: number; percentage: number }>;
        by_payment_method?: Array<{ source: string; revenue: number; percentage: number }>;
        by_customer_segment?: Array<{ source: string; revenue: number; percentage: number }>;
      };
      top_revenue_driver?: string;
      concentration_risk?: string;
    };
    market_opportunity_scoring?: {
      opportunities?: Array<{ type: string; name: string; opportunity_score: number; current_revenue: number; profit_margin: number; growth_potential: string; recommendation: string }>;
      total_opportunities?: number;
      high_priority_count?: number;
    };
    executive_summary?: {
      key_metrics?: { total_revenue: number; total_profit: number; profit_margin: number; growth_rate: number; customer_count: number; repeat_rate: number };
      top_performers?: { top_product: string; top_customer: string; top_region: string };
      critical_risks?: string[];
      key_opportunities?: string[];
      strategic_recommendations?: string[];
      financial_health?: string;
      next_30_days_forecast?: string | number;
    };
    predictive_churn_analysis?: {
      high_risk_customers?: Array<{ customer: string; last_purchase: string; days_since_last: number; purchase_count: number; churn_probability: number; risk_tier: string }>;
      medium_risk_customers?: Array<{ customer: string; last_purchase: string; days_since_last: number; purchase_count: number; churn_probability: number; risk_tier: string }>;
      risk_distribution?: { high: number; medium: number; low: number };
      average_churn_probability?: number;
      recommended_actions?: string[];
    };
    inventory_optimization?: {
      abc_analysis?: Array<{ product: string; abc_class: string; total_sales: number; total_qty: number }>;
      recommendations?: Array<{ product: string; action: string; reason: string; reorder_point: number }>;
      total_products_analyzed?: number;
      high_priority_products?: number;
    };
    break_even_analysis?: {
      total_fixed_costs?: number;
      total_variable_costs?: number;
      contribution_margin_pct?: number;
      break_even_revenue?: number;
      break_even_units?: number;
      current_revenue?: number;
      margin_of_safety?: number;
      by_product?: Array<any>;
      status?: string;
    };
    customer_journey_mapping?: {
      journey_stages?: {
        new?: { count: number; percentage: number };
        engaged?: { count: number; percentage: number };
        active?: { count: number; percentage: number };
        at_risk?: { count: number; percentage: number };
        churned?: { count: number; percentage: number };
      };
      conversion_funnel?: { awareness: number; consideration: number; purchase: number; retention: number };
      drop_off_points?: Array<{ stage: string; drop_off_rate: number }>;
      recommendations?: string[];
    };
    next_best_actions?: {
      actions?: Array<{ entity_type: string; entity_name: string; current_value: number; recommended_action: string; expected_impact: string; priority: string; action_category: string }>;
      total_actions?: number;
      high_priority_count?: number;
      action_categories?: string[];
    };
    advanced_anomaly_detection?: {
      anomalies?: Array<{ type: string; severity: string; value?: number; date?: string; change_percentage?: number; expected_range?: string; z_score?: number; explanation: string; recommended_action: string }>;
      total_anomalies?: number;
      high_severity_count?: number;
      anomaly_types?: string[];
    };
    competitive_positioning?: {
      internal_market_share?: { total_revenue: number; estimated_market_penetration: number; estimated_total_market: number };
      product_positioning?: Array<{ product: string; internal_share: number; estimated_market_share: number; position: string }>;
      competitive_benchmarks?: { market_leader_threshold: number; strong_player_threshold: number; recommendation: string };
    };
    profit_margin_optimization?: {
      recommendations?: Array<{ entity: string; entity_type?: string; current_margin: number; current_revenue: number; optimization_strategy: string; expected_margin_improvement: number; potential_profit_increase?: number; priority: string }>;
      total_opportunities?: number;
      estimated_total_profit_increase?: number;
      current_average_margin?: number;
      target_margin?: number;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const EnterpriseInsights: React.FC<EnterpriseInsightsProps> = ({ insights, userTier = 'free' }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [showAllAnomalies, setShowAllAnomalies] = useState(false);

  // Add/remove blur class to insights panel when modal is open
  useEffect(() => {
    const insightsPanel = document.querySelector('[data-insights-panel]');
    if (showAllAnomalies) {
      insightsPanel?.classList.add('blur-sm');
    } else {
      insightsPanel?.classList.remove('blur-sm');
    }
    return () => {
      insightsPanel?.classList.remove('blur-sm');
    };
  }, [showAllAnomalies]);

  // Inject custom scrollbar styles for modal
  useEffect(() => {
    const styleId = 'anomalies-modal-scrollbar-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      .anomalies-modal-scrollable::-webkit-scrollbar {
        width: 6px;
      }
      .anomalies-modal-scrollable::-webkit-scrollbar-track {
        background: ${colors.isDark ? 'rgba(11, 27, 59, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        border-radius: 10px;
      }
      .anomalies-modal-scrollable::-webkit-scrollbar-thumb {
        background: ${colors.isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'};
        border-radius: 10px;
      }
      .anomalies-modal-scrollable::-webkit-scrollbar-thumb:hover {
        background: ${colors.isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'};
      }
    `;

    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [colors.isDark]);

  // Sort anomalies by severity: High > Medium > Low
  const sortedAnomalies = useMemo(() => {
    if (!insights?.advanced_anomaly_detection?.anomalies || insights.advanced_anomaly_detection.anomalies.length === 0) {
      return [];
    }
    const severityOrder: { [key: string]: number } = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return [...insights.advanced_anomaly_detection.anomalies].sort((a, b) => {
      const aSeverity = severityOrder[a.severity] || 0;
      const bSeverity = severityOrder[b.severity] || 0;
      return bSeverity - aSeverity; // Descending order
    });
  }, [insights?.advanced_anomaly_detection?.anomalies]);

  // Check if any enterprise insights exist
  // First check if property exists, then check if it has meaningful data
  const checkInsight = (insight: any): boolean => {
    if (!insight) return false;
    if (typeof insight === 'object') {
      const keys = Object.keys(insight);
      // If it's an array, check if it has items
      if (Array.isArray(insight)) return insight.length > 0;
      // If it's an object, check if it has keys and at least one non-empty value
      if (keys.length === 0) return false;
      // Check if at least one value is not null/undefined/empty
      return keys.some(key => {
        const value = insight[key];
        if (value === null || value === undefined) return false;
        if (typeof value === 'object' && !Array.isArray(value)) {
          return Object.keys(value).length > 0;
        }
        return true;
      });
    }
    return true;
  };

  const hasEnterpriseInsights = insights && (
    checkInsight(insights.executive_summary) ||
    checkInsight(insights.predictive_forecast_with_ci) ||
    checkInsight(insights.scenario_planning) ||
    checkInsight(insights.price_elasticity_analysis) ||
    checkInsight(insights.cash_flow_forecast) ||
    checkInsight(insights.revenue_attribution) ||
    checkInsight(insights.market_opportunity_scoring) ||
    checkInsight(insights.predictive_churn_analysis) ||
    checkInsight(insights.inventory_optimization) ||
    checkInsight(insights.break_even_analysis) ||
    checkInsight(insights.customer_journey_mapping) ||
    checkInsight(insights.next_best_actions) ||
    checkInsight(insights.advanced_anomaly_detection) ||
    checkInsight(insights.competitive_positioning) ||
    checkInsight(insights.profit_margin_optimization)
  );

  // Debug: Log enterprise insights (must be before any conditional returns)
  React.useEffect(() => {
    if (userTier === 'enterprise') {
      console.log("🚀 Enterprise Insights Debug:", {
        userTier,
        hasEnterpriseInsights,
        hasExecutiveSummary: !!insights?.executive_summary,
        hasPredictiveForecast: !!insights?.predictive_forecast_with_ci,
        hasScenarioPlanning: !!insights?.scenario_planning,
        insightsKeys: insights ? Object.keys(insights).filter(k => 
          k.includes('predictive') || k.includes('scenario') || k.includes('executive') || 
          k.includes('elasticity') || k.includes('cash_flow') || k.includes('revenue_attribution') ||
          k.includes('market_opportunity') || k.includes('churn') || k.includes('inventory') ||
          k.includes('break_even') || k.includes('journey') || k.includes('next_best') ||
          k.includes('anomaly') || k.includes('competitive') || k.includes('optimization')
        ) : [],
        executive_summary: insights?.executive_summary,
        price_elasticity: insights?.price_elasticity_analysis,
        cash_flow: insights?.cash_flow_forecast,
        break_even: insights?.break_even_analysis,
      });
    }
  }, [insights, userTier, hasEnterpriseInsights]);

  // Only show for enterprise tier
  if (userTier !== 'enterprise') {
    return null;
  }

  if (!hasEnterpriseInsights) {
    return (
      <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
        <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>🚀 Enterprise-Level Insights</h2>
        <p className={colors.textSecondary}>Enterprise insights are being calculated. Please wait...</p>
        <p className={`text-xs mt-2 ${colors.textSecondary}`}>
          Debug: Check console for enterprise insights data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>🚀 Enterprise-Level Insights</h2>

      {/* Executive Summary - Full Width */}
      {insights?.executive_summary && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`}>
          <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>📋 Executive Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.executive_summary.key_metrics && Object.entries(insights.executive_summary.key_metrics).map(([key, value]) => {
              // Format value based on key type
              let formattedValue: string;
              let subtitle: string | null = null;
              if (typeof value === 'number') {
                if (key.includes('revenue') || key.includes('profit')) {
                  formattedValue = `$${value.toLocaleString()}`;
                } else if (key.includes('rate') || key.includes('margin')) {
                  // Add percent sign for rate and margin fields
                  formattedValue = `${value.toLocaleString()}%`;
                  // Add subtitle for growth_rate to explain calculation method
                  if (key.includes('growth_rate')) {
                    subtitle = 'CAGR (Regression-Based)';
                  }
                } else {
                  formattedValue = value.toLocaleString();
                }
              } else {
                formattedValue = String(value);
              }
              
              return (
                <div key={key} className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                  <p className={`text-sm ${colors.textSecondary} mb-1`}>{key.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className={`text-2xl font-bold ${colors.accent}`}>
                    {formattedValue}
                  </p>
                  {subtitle && (
                    <p className={`text-[10px] ${colors.textSecondary} mt-1 opacity-75`}>{subtitle}</p>
                  )}
                </div>
              );
            })}
          </div>
          {insights.executive_summary.strategic_recommendations && insights.executive_summary.strategic_recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className={`font-semibold ${colors.text} mb-2`}>Strategic Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {insights.executive_summary.strategic_recommendations.map((rec, idx) => (
                  <li key={idx} className={colors.textSecondary}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Predictive Forecast with Confidence Intervals - Full Width Chart */}
      {insights?.predictive_forecast_with_ci?.forecast && insights.predictive_forecast_with_ci.forecast.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`}>
          <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>📊 Predictive Forecast with Confidence Intervals</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={insights.predictive_forecast_with_ci.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="date" tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }} />
              <YAxis 
                tick={{ fill: colors.isDark ? '#ffffff' : '#111827' }}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                  border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                  color: colors.isDark ? '#ffffff' : '#111827' 
                }}
                formatter={(value: number, name?: string | number) => formatTooltipValue(value, name)}
              />
              <Area type="monotone" dataKey="ci_95_upper" fill="#8884d8" fillOpacity={0.1} stroke="none" />
              <Area type="monotone" dataKey="ci_95_lower" fill="#8884d8" fillOpacity={0.1} stroke="none" />
              <Area type="monotone" dataKey="ci_80_upper" fill="#82ca9d" fillOpacity={0.2} stroke="none" />
              <Area type="monotone" dataKey="ci_80_lower" fill="#82ca9d" fillOpacity={0.2} stroke="none" />
              <Line type="monotone" dataKey="predicted" stroke={colors.accent} strokeWidth={2} dot={false} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
          <p className={`text-sm ${colors.textSecondary} mt-2`}>
            Standard Error: {insights.predictive_forecast_with_ci.std_error?.toFixed(2)}
          </p>
        </div>
      )}

      {/* Scenario Planning - Full Width */}
      {insights?.scenario_planning?.scenarios && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`}>
          <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>📈 Scenario Planning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(insights.scenario_planning.scenarios).map(([scenario, data]: [string, any]) => (
              <div key={scenario} className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <h4 className={`font-semibold ${colors.text} mb-2 capitalize`}>{scenario}</h4>
                <p className={`text-sm ${colors.textSecondary} mb-3`}>{data.description}</p>
                <div className="space-y-2">
                  <div>
                    <p className={`text-xs ${colors.textSecondary}`}>30-Day Forecast</p>
                    <p className={`text-lg font-bold ${colors.accent}`}>${(data as any)['30_day_forecast']?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${colors.textSecondary}`}>90-Day Forecast</p>
                    <p className={`text-lg font-bold ${colors.accent}`}>${(data as any)['90_day_forecast']?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Layout for Smaller Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Break-Even Analysis */}
        {insights?.break_even_analysis && (
          <div className={`${glassmorphismClass} p-6 rounded-xl`}>
            <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>💰 Break-Even Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Break-Even Revenue</p>
                <p className={`text-xl font-bold ${colors.accent}`}>${insights.break_even_analysis.break_even_revenue?.toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Margin of Safety</p>
                <p className={`text-xl font-bold ${colors.accent}`}>{insights.break_even_analysis.margin_of_safety?.toFixed(1)}%</p>
              </div>
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Contribution Margin</p>
                <p className={`text-xl font-bold ${colors.accent}`}>{insights.break_even_analysis.contribution_margin_pct?.toFixed(1)}%</p>
              </div>
              <div className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <p className={`text-sm ${colors.textSecondary} mb-1`}>Status</p>
                <p className={`text-xl font-bold ${insights.break_even_analysis.status === 'Profitable' ? 'text-green-400' : 'text-red-400'}`}>
                  {insights.break_even_analysis.status}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profit Margin Optimization */}
        {insights?.profit_margin_optimization?.recommendations && insights.profit_margin_optimization.recommendations.length > 0 && (
          <div className={`${glassmorphismClass} p-6 rounded-xl`}>
            <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>💰 Profit Margin Optimization</h3>
            <div className={`mb-4 p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Estimated Total Profit Increase</p>
              <p className={`text-2xl font-bold ${colors.accent}`}>
                ${insights.profit_margin_optimization.estimated_total_profit_increase?.toLocaleString()}
              </p>
            </div>
            <div className="space-y-3">
              {insights.profit_margin_optimization.recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                  <p className={`font-semibold ${colors.text}`}>{rec.entity}</p>
                  <p className={`text-sm ${colors.textSecondary}`}>{rec.optimization_strategy}</p>
                  <div className="flex gap-4 mt-2">
                    <span className={`text-sm ${colors.textSecondary}`}>Current: {rec.current_margin}%</span>
                    <span className={`text-sm ${colors.accent}`}>Target: {rec.expected_margin_improvement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictive Churn Analysis */}
        {insights?.predictive_churn_analysis && (
          <div className={`${glassmorphismClass} p-6 rounded-xl`}>
            <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>⚠️ Predictive Churn Analysis</h3>
            {insights.predictive_churn_analysis.risk_distribution && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.entries(insights.predictive_churn_analysis.risk_distribution).map(([risk, count]: [string, any]) => (
                  <div key={risk} className={`p-4 rounded-lg text-center ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                    <p className={`text-2xl font-bold ${colors.accent}`}>{count}</p>
                    <p className={`text-sm ${colors.textSecondary} capitalize`}>{risk} Risk</p>
                  </div>
                ))}
              </div>
            )}
            {insights.predictive_churn_analysis.recommended_actions && (
              <div>
                <h4 className={`font-semibold ${colors.text} mb-2`}>Recommended Actions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {insights.predictive_churn_analysis.recommended_actions.slice(0, 3).map((action, idx) => (
                    <li key={idx} className={colors.textSecondary}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Anomaly Detection - Full Width Section */}
      {sortedAnomalies.length > 0 && (
        <>
          <div className={`${glassmorphismClass} p-6 rounded-xl`}>
            <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>🔍 Advanced Anomaly Detection</h3>
            <div className={`mb-4 p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
              <p className={`text-sm ${colors.textSecondary}`}>Total Anomalies Detected</p>
              <p className={`text-2xl font-bold ${colors.accent}`}>{insights?.advanced_anomaly_detection?.total_anomalies || sortedAnomalies.length}</p>
              <p className={`text-sm ${colors.textSecondary} mt-1`}>
                High Severity: {insights?.advanced_anomaly_detection?.high_severity_count || 0}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedAnomalies.slice(0, 6).map((anomaly, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${colors.text} text-sm mb-1`}>{anomaly.type}</p>
                      <p className={`text-xs ${colors.textSecondary} truncate`} title={(anomaly as any).context || `Row #${idx + 1}`}>
                        📍 {(anomaly as any).context || `Row #${idx + 1}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ml-2 ${
                      anomaly.severity === 'High' 
                        ? 'bg-red-500/20 text-red-400' 
                        : anomaly.severity === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className={`text-xs ${colors.textSecondary} mb-2 line-clamp-2`}>{anomaly.explanation}</p>
                  <p className={`text-xs ${colors.accent} font-medium`}>💡 {anomaly.recommended_action}</p>
                </div>
              ))}
            </div>
            {sortedAnomalies.length > 6 && (
              <button
                onClick={() => setShowAllAnomalies(true)}
                className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  colors.isDark
                    ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                    : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600'
                }`}
              >
                View More ({sortedAnomalies.length} anomalies)
              </button>
            )}
          </div>

          {/* Modal for All Anomalies - Rendered via Portal to avoid blur */}
          {showAllAnomalies && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div 
                className={`${glassmorphismClass} rounded-xl p-6 max-w-4xl w-full anomalies-modal-scrollable overflow-y-auto`} 
                style={{ 
                  boxShadow: colors.cardShadow,
                  height: 'calc(107vh - 210px - 40px)',
                  maxHeight: 'calc(107vh - 210px - 40px)',
                  minHeight: '560px',
                  // Firefox scrollbar
                  scrollbarWidth: 'thin',
                  scrollbarColor: colors.isDark 
                    ? 'rgba(59, 130, 246, 0.6) rgba(11, 27, 59, 0.3)' 
                    : 'rgba(59, 130, 246, 0.4) rgba(229, 231, 235, 0.3)',
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-2xl font-bold ${colors.text}`}>🔍 All Anomalies Detected</h3>
                  <button
                    onClick={() => setShowAllAnomalies(false)}
                    className={`p-2 rounded-lg transition-all ${
                      colors.isDark
                        ? 'hover:bg-white/10 text-gray-300'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className={`mb-4 p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                  <p className={`text-sm ${colors.textSecondary}`}>Total Anomalies: {insights?.advanced_anomaly_detection?.total_anomalies || sortedAnomalies.length}</p>
                  <p className={`text-sm ${colors.textSecondary} mt-1`}>
                    High Severity: {insights?.advanced_anomaly_detection?.high_severity_count || 0}
                  </p>
                </div>
                <div className="space-y-3">
                  {sortedAnomalies.map((anomaly, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className={`font-semibold ${colors.text} mb-1`}>{anomaly.type}</p>
                          <p className={`text-xs ${colors.textSecondary} mb-1`}>
                            📍 {(anomaly as any).context || `Row #${idx + 1}`}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ml-2 ${
                          anomaly.severity === 'High' 
                            ? 'bg-red-500/20 text-red-400' 
                            : anomaly.severity === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {anomaly.severity}
                        </span>
                      </div>
                      <p className={`text-sm ${colors.textSecondary} mb-2`}>{anomaly.explanation}</p>
                      {(anomaly as any).value && (
                        <p className={`text-xs ${colors.textSecondary} mb-2`}>
                          Value: <span className={colors.accent}>${(anomaly as any).value.toLocaleString()}</span>
                        </p>
                      )}
                      <p className={`text-sm ${colors.accent} mt-1 font-medium`}>💡 {anomaly.recommended_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}

      {/* Full Width Sections Below Grid */}
      {/* Market Opportunity Scoring */}
      {insights?.market_opportunity_scoring?.opportunities && insights.market_opportunity_scoring.opportunities.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`}>
          <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>🎯 Market Opportunity Scoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.market_opportunity_scoring.opportunities.slice(0, 10).map((opp, idx) => (
              <div key={idx} className={`p-4 rounded-lg flex justify-between items-center ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <div>
                  <p className={`font-semibold ${colors.text}`}>{opp.name} ({opp.type})</p>
                  <p className={`text-sm ${colors.textSecondary}`}>{opp.recommendation}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${colors.accent}`}>{opp.opportunity_score.toFixed(1)}</p>
                  <p className={`text-xs ${colors.textSecondary}`}>{opp.growth_potential} Potential</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Best Actions */}
      {insights?.next_best_actions?.actions && insights.next_best_actions.actions.length > 0 && (
        <div className={`${glassmorphismClass} p-6 rounded-xl`}>
          <h3 className={`text-xl font-semibold ${colors.text} mb-4`}>🎯 Next Best Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.next_best_actions.actions.slice(0, 10).map((action, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-100/80'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className={`font-semibold ${colors.text}`}>{action.entity_name} ({action.entity_type})</p>
                    <p className={`text-sm ${colors.textSecondary}`}>{action.recommended_action}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${action.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {action.priority}
                  </span>
                </div>
                <p className={`text-sm ${colors.accent}`}>{action.expected_impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Enterprise Insights can be added here */}
    </div>
  );
};

export default EnterpriseInsights;

