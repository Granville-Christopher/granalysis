import React from "react";
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

  const columns = Object.keys(data[0]);

  // Helper function to check if a column contains dates
  const isDateColumn = (colName: string): boolean => {
    const dateKeywords = ['date', 'time', 'created', 'updated', 'timestamp'];
    return dateKeywords.some(keyword => colName.toLowerCase().includes(keyword));
  };

  // Find the date column
  const dateColumn = columns.find(col => isDateColumn(col));

  // Sort data by date column (newest first) if date column exists
  const sortedData = dateColumn
    ? [...data].sort((a, b) => {
        const dateA = new Date(a[dateColumn]);
        const dateB = new Date(b[dateColumn]);
        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // Keep original order if invalid dates
        }
        // Sort descending (newest first)
        return dateB.getTime() - dateA.getTime();
      })
    : data;

  // Helper function to format date to human-readable format
  const formatDate = (value: any): string => {
    if (!value) return String(value || '-');
    
    try {
      const date = new Date(value);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return String(value);
      }
      // Format as: "Jan 15, 2024"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(value);
    }
  };

  // Helper function to format cell value
  const formatCellValue = (value: any, colName: string): string => {
    if (value === null || value === undefined) return '-';
    if (isDateColumn(colName)) {
      return formatDate(value);
    }
    return String(value);
  };

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
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <thead className="sticky top-0" style={{ backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
                <tr>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}
                      style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${colors.isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
                {sortedData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <p className={`text-sm ${colors.textSecondary}`}>
            Showing {sortedData.length} row{sortedData.length !== 1 ? "s" : ""}
            {dateColumn && ` (sorted by ${dateColumn}, newest first)`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataTableModal;

