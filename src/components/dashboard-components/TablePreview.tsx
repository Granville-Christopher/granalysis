import React from "react";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface TablePreviewProps {
  data?: any[];
  loading?: boolean;
}

const TablePreview: React.FC<TablePreviewProps> = ({ data, loading }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  if (loading) {
    return (
      <div className={`${glassmorphismClass} p-6`} style={{ 
        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        boxShadow: colors.cardShadow 
      }}>
        <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>Data Preview</h3>
        <p className={`text-sm ${colors.textSecondary}`}>Loading data...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={`${glassmorphismClass} p-6`} style={{ 
        backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        boxShadow: colors.cardShadow 
      }}>
        <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>Data Preview</h3>
        <p className={`text-sm ${colors.textSecondary}`}>
          Select a file to view data preview
        </p>
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
      // Format as: "Jan 15, 2024" or "01/15/2024"
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
    if (typeof value === 'object') return JSON.stringify(value);
    if (isDateColumn(colName)) {
      return formatDate(value);
    }
    return String(value);
  };

  return (
    <div className={`${glassmorphismClass} p-6`} style={{ 
      backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      boxShadow: colors.cardShadow
    }}>
      <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>Data Preview</h3>
      <div 
        className="overflow-x-auto overflow-y-scroll rounded-lg"
        style={{ 
          maxHeight: '600px',
          height: '600px',
          display: 'block'
        }}
      >
        <table className="min-w-full divide-y" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <thead className="sticky top-0 z-10" style={{ backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}
                  style={{ borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }` }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            {sortedData.map((row, i) => (
              <tr key={i} className={`text-sm ${colors.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                {columns.map((col, j) => (
                  <td key={j} className={`px-6 py-4 whitespace-nowrap ${colors.text}`}>
                    {formatCellValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePreview;
