import React, { useEffect, useMemo, memo, useCallback } from "react";
import { X } from "lucide-react";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface DataTableModalProps {
  data?: any[];
  loading?: boolean;
  onClose: () => void;
}

const DataTableModal: React.FC<DataTableModalProps> = ({ data, loading, onClose }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  // Inject custom scrollbar styles for data table
  useEffect(() => {
    const styleId = 'data-table-scrollbar-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      .data-table-scrollable::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .data-table-scrollable::-webkit-scrollbar-track {
        background: ${colors.isDark ? 'rgba(11, 27, 59, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        border-radius: 10px;
      }
      .data-table-scrollable::-webkit-scrollbar-thumb {
        background: ${colors.isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'};
        border-radius: 10px;
      }
      .data-table-scrollable::-webkit-scrollbar-thumb:hover {
        background: ${colors.isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'};
      }
      .data-table-scrollable::-webkit-scrollbar-corner {
        background: ${colors.isDark ? 'rgba(11, 27, 59, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
      }
    `;

    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [colors.isDark]);

  // Helper function to check if a column contains dates
  const isDateColumn = useCallback((colName: string): boolean => {
    const dateKeywords = ['date', 'time', 'created', 'updated', 'timestamp'];
    return dateKeywords.some(keyword => colName.toLowerCase().includes(keyword));
  }, []);

  // Memoize columns (with safe fallback)
  const columns = useMemo(() => {
    if (!data || !data.length || !data[0]) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Memoize date column
  const dateColumn = useMemo(() => {
    if (!columns.length) return undefined;
    return columns.find(col => isDateColumn(col));
  }, [columns, isDateColumn]);

  // Memoize sorted and limited data (max 200 rows)
  const sortedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    let processed = data;
    
    // Sort by date column (newest first) if date column exists
    if (dateColumn) {
      processed = [...data].sort((a, b) => {
        const dateA = new Date(a[dateColumn]);
        const dateB = new Date(b[dateColumn]);
        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // Keep original order if invalid dates
        }
        // Sort descending (newest first)
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    // Limit to first 200 rows
    return processed.slice(0, 200);
  }, [data, dateColumn]);

  // Memoize format cell value function for stable reference
  const formatCellValue = useCallback((value: any, colName: string): string => {
    if (value === null || value === undefined) return '-';
    if (isDateColumn(colName)) {
      // Format date to human-readable format
      if (!value) return String(value || '-');
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return String(value);
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  }, [isDateColumn]);

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backdropFilter: "blur(10px)",
          backgroundColor: colors.isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
        }}
        onClick={onClose}
      >
        <div
          className={`${glassmorphismClass} p-8 rounded-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
          style={{ 
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            boxShadow: colors.cardShadow 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-2xl font-semibold ${colors.text}`}>Data Preview</h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              <X className={`w-5 h-5 ${colors.text}`} />
            </button>
          </div>
          <p className={`text-sm ${colors.textSecondary}`}>Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backdropFilter: "blur(10px)",
          backgroundColor: colors.isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
        }}
        onClick={onClose}
      >
        <div
          className={`${glassmorphismClass} p-8 rounded-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
          style={{ 
            backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            boxShadow: colors.cardShadow 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-2xl font-semibold ${colors.text}`}>Data Preview</h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              <X className={`w-5 h-5 ${colors.text}`} />
            </button>
          </div>
          <p className={`text-sm ${colors.textSecondary}`}>
            No data available to preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: colors.isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
      }}
      onClick={onClose}
    >
      <div
        className={`${glassmorphismClass} rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
        style={{ boxShadow: colors.cardShadow }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <h3 className={`text-2xl font-semibold ${colors.text}`}>Data Preview</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
          >
            <X className={`w-6 h-6 ${colors.text}`} />
          </button>
        </div>

        {/* Table Container */}
        <div 
          className="flex-1 p-6 overflow-hidden"
        >
          <div 
            className="h-full overflow-auto rounded-lg data-table-scrollable" 
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: colors.isDark 
                ? 'rgba(59, 130, 246, 0.6) rgba(11, 27, 59, 0.3)' 
                : 'rgba(59, 130, 246, 0.4) rgba(229, 231, 235, 0.3)',
            }}
          >
            <div className="overflow-x-auto data-table-scrollable" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: colors.isDark 
                ? 'rgba(59, 130, 246, 0.6) rgba(11, 27, 59, 0.3)' 
                : 'rgba(59, 130, 246, 0.4) rgba(229, 231, 235, 0.3)',
            }}>
              <table className="min-w-full divide-y" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap ${colors.textSecondary}`}
                        style={{ 
                          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 1)' : 'rgba(255, 255, 255, 1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          position: 'sticky',
                          top: 0,
                          zIndex: 20,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
              <tbody className={`divide-y ${colors.isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
                {sortedData.map((row, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    row={row}
                    columns={columns}
                    formatCellValue={formatCellValue}
                    colors={colors}
                  />
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <p className={`text-sm ${colors.textSecondary}`}>
            Showing {sortedData.length} of {data.length} row{sortedData.length !== 1 ? "s" : ""}
            {sortedData.length < data.length && ` (first ${sortedData.length} rows shown)`}
            {dateColumn && ` • Sorted by ${dateColumn}, newest first`}
          </p>
        </div>
      </div>
    </div>
  );
};

// Memoized table row component for performance
const TableRow = memo(({ row, columns, formatCellValue, colors }: {
  row: any;
  columns: string[];
  formatCellValue: (value: any, colName: string) => string;
  colors: ThemeConfig;
}) => {
  return (
    <tr
      className={`transition-colors ${
        colors.isDark
          ? "hover:bg-white/5"
          : "hover:bg-gray-50"
      }`}
    >
      {columns.map((col, colIdx) => (
        <td
          key={colIdx}
          className={`px-6 py-4 whitespace-nowrap text-sm ${colors.text}`}
          style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
        >
          {formatCellValue(row[col], col)}
        </td>
      ))}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export default DataTableModal;

