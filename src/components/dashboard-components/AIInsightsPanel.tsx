import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface AIInsightsPanelProps {
  aiRecommendations?: string[];
  aiOpportunities?: string[];
  aiRisks?: string[];
  aiAnomalies?: string[];
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  aiRecommendations = [],
  aiOpportunities = [],
  aiRisks = [],
  aiAnomalies = [],
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'opportunities' | 'risks' | 'anomalies'>('recommendations');

  const hasAnyAI = aiRecommendations.length > 0 || aiOpportunities.length > 0 || aiRisks.length > 0 || aiAnomalies.length > 0;

  if (!hasAnyAI) {
    return null;
  }

  const tabs = [
    { id: 'recommendations' as const, label: 'Recommendations', icon: Sparkles, data: aiRecommendations, color: 'blue' },
    { id: 'opportunities' as const, label: 'Opportunities', icon: Lightbulb, data: aiOpportunities, color: 'green' },
    { id: 'risks' as const, label: 'Risks', icon: AlertTriangle, data: aiRisks, color: 'red' },
    { id: 'anomalies' as const, label: 'Anomalies', icon: Zap, data: aiAnomalies, color: 'yellow' },
  ].filter(tab => tab.data.length > 0);

  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className={`${glassmorphismClass} p-6 rounded-xl`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6" style={{ color: colors.accent }} />
        <h3 className={`text-xl font-semibold ${colors.text}`}>🤖 AI-Powered Insights</h3>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? `text-white font-semibold`
                    : `${colors.textSecondary} hover:${colors.text}`
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                        boxShadow: `0 2px 8px ${colors.accent}40`,
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.data.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : colors.isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}>
                    {tab.data.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {activeTabData && activeTabData.data.length > 0 ? (
          activeTabData.data.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                colors.isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
              style={{
                borderLeftColor: 
                  activeTabData.color === 'blue' ? '#3b82f6' :
                  activeTabData.color === 'green' ? '#10b981' :
                  activeTabData.color === 'red' ? '#ef4444' :
                  '#eab308',
              }}
            >
              <div className="flex items-start gap-3">
                {activeTabData.color === 'blue' && <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                {activeTabData.color === 'green' && <Lightbulb className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}
                {activeTabData.color === 'red' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
                {activeTabData.color === 'yellow' && <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />}
                <p className={`${colors.text} flex-1`}>{item}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={`text-center py-8 ${colors.textSecondary}`}>
            No {activeTabData?.label.toLowerCase()} available at this time.
          </p>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;

