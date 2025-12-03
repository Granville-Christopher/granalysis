import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import api from '../../utils/axios';

interface QualityScore {
  fileId: number;
  fileName?: string;
  overallScore?: number;
  completeness?: number;
  accuracy?: number;
  consistency?: number;
  timeliness?: number;
  validity?: number;
  issues?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    count: number;
  }>;
  lastChecked?: string;
}

interface DataQualityPanelProps {
  fileId?: number;
  onClose?: () => void;
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({ fileId, onClose }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [scores, setScores] = useState<QualityScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityScores();
  }, [fileId]);

  const fetchQualityScores = async () => {
    try {
      setLoading(true);
      const endpoint = fileId ? `/data-quality/files/${fileId}/score` : '/data-quality/scores';
      const res = await api.get(endpoint);
      if (res.data?.status === 'success') {
        const data = res.data.scores || res.data.score;
        if (data) {
          // Ensure all scores have valid numeric values
          const normalizedScores = (Array.isArray(data) ? data : [data]).map((score: any) => ({
            ...score,
            overallScore: typeof score.overallScore === 'number' ? score.overallScore : 0,
            completeness: typeof score.completeness === 'number' ? score.completeness : 0,
            accuracy: typeof score.accuracy === 'number' ? score.accuracy : 0,
            consistency: typeof score.consistency === 'number' ? score.consistency : 0,
            timeliness: typeof score.timeliness === 'number' ? score.timeliness : 0,
            validity: typeof score.validity === 'number' ? score.validity : 0,
            issues: Array.isArray(score.issues) ? score.issues : [],
          }));
          setScores(normalizedScores);
        } else {
          setScores([]);
        }
      } else {
        setScores([]);
      }
    } catch (error) {
      console.error('Failed to fetch quality scores:', error);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | undefined | null) => {
    const numScore = score ?? 0;
    if (numScore >= 80) return '#10b981'; // green
    if (numScore >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreIcon = (score: number | undefined | null) => {
    const numScore = score ?? 0;
    if (numScore >= 80) return <CheckCircle className="w-5 h-5" style={{ color: getScoreColor(numScore) }} />;
    if (numScore >= 60) return <AlertCircle className="w-5 h-5" style={{ color: getScoreColor(numScore) }} />;
    return <XCircle className="w-5 h-5" style={{ color: getScoreColor(numScore) }} />;
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return '#ef4444';
    if (severity === 'medium') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div className={`${glassmorphismClass} rounded-lg p-6`} style={{ boxShadow: colors.cardShadow }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: colors.accent }} />
          <h3 className={`text-xl font-bold ${colors.text}`}>Data Quality Scores</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchQualityScores}
            className={`p-2 rounded-lg transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" style={{ color: colors.accent }} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${colors.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <span className="material-icons text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.accent }}></div>
          <p className={`mt-2 ${colors.textSecondary}`}>Loading quality scores...</p>
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color: colors.accent }} />
          <p className={colors.textSecondary}>No quality scores available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scores.map((score) => (
            <div
              key={score.fileId}
              className={`p-4 rounded-lg border ${
                colors.isDark ? 'border-white/10' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`font-semibold ${colors.text}`}>{score.fileName || 'Unknown File'}</h4>
                  {score.lastChecked && (
                    <p className={`text-sm ${colors.textSecondary}`}>
                      Last checked: {new Date(score.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getScoreIcon(score.overallScore ?? 0)}
                  <div>
                    <div className="text-2xl font-bold" style={{ color: getScoreColor(score.overallScore ?? 0) }}>
                      {(score.overallScore ?? 0).toFixed(1)}
                    </div>
                    <div className="text-xs" style={{ color: colors.textSecondary }}>Overall</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {[
                  { label: 'Completeness', value: score.completeness },
                  { label: 'Accuracy', value: score.accuracy },
                  { label: 'Consistency', value: score.consistency },
                  { label: 'Timeliness', value: score.timeliness },
                  { label: 'Validity', value: score.validity },
                ].map((metric) => {
                  const value = metric.value ?? 0;
                  return (
                    <div key={metric.label} className="text-center">
                      <div className="text-sm" style={{ color: colors.textSecondary }}>{metric.label}</div>
                      <div className="text-lg font-semibold" style={{ color: getScoreColor(value) }}>
                        {value.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {score.issues && score.issues.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <h5 className={`font-semibold mb-2 ${colors.text}`}>Issues Found</h5>
                  <div className="space-y-2">
                    {score.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded"
                        style={{ backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getSeverityColor(issue.severity) }}
                          />
                          <span className={`text-sm ${colors.text}`}>{issue.message}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${colors.textSecondary}`}>
                          {issue.count} occurrences
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

