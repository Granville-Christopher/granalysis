import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Filter, X, Calendar, FileText, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';

export interface FilterOptions {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  fileType?: string;
  minSize?: number;
  maxSize?: number;
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  onFilterChange,
  initialFilters = {},
  onModalStateChange,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  // Notify parent when modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(isOpen);
    }
  }, [isOpen, onModalStateChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          hasActiveFilters
            ? 'bg-blue-500 text-white'
            : colors.isDark
            ? 'bg-white/10 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
        aria-label="Open filters"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
            {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
          </span>
        )}
      </button>

      {isOpen ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            // Very light backdrop - just enough for visual separation
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            // No backdropFilter - keeps sidebar and header completely sharp and visible
            // Position backdrop to not interfere with sidebar/header visibility
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`relative z-50 ${glassmorphismClass} rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-300`}
            style={{
              backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), ${colors.cardShadow}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${colors.text}`}>Filter Files</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded hover:bg-white/10 ${colors.textSecondary}`}
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by filename..."
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    colors.isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-200'
                  }`}
                  style={{
                    color: colors.text,
                  }}
                />
              </div>

              {/* Date Range */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className={`px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      colors.isDark
                        ? 'bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-gray-200'
                    }`}
                    style={{
                      color: colors.text,
                    }}
                  />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className={`px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      colors.isDark
                        ? 'bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-gray-200'
                    }`}
                    style={{
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* File Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  <FileText className="w-4 h-4 inline mr-1" />
                  File Type
                </label>
                <select
                  value={filters.fileType || ''}
                  onChange={(e) => handleFilterChange('fileType', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    colors.isDark
                      ? 'bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-gray-200'
                  }`}
                  style={{
                    color: colors.text,
                  }}
                >
                  <option 
                    value=""
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#FFFFFF',
                      color: colors.text,
                    }}
                  >
                    All Types
                  </option>
                  <option 
                    value="csv"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#FFFFFF',
                      color: colors.text,
                    }}
                  >
                    CSV
                  </option>
                  <option 
                    value="xlsx"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#FFFFFF',
                      color: colors.text,
                    }}
                  >
                    Excel
                  </option>
                  <option 
                    value="json"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#FFFFFF',
                      color: colors.text,
                    }}
                  >
                    JSON
                  </option>
                  <option 
                    value="sql"
                    style={{
                      backgroundColor: colors.isDark ? '#0B1B3B' : '#FFFFFF',
                      color: colors.text,
                    }}
                  >
                    SQL
                  </option>
                </select>
              </div>

              {/* Size Range */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  File Size (KB)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minSize || ''}
                    onChange={(e) => handleFilterChange('minSize', e.target.value ? Number(e.target.value) : undefined)}
                    className={`px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      colors.isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-200'
                    }`}
                    style={{
                      color: colors.text,
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxSize || ''}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : undefined)}
                    className={`px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      colors.isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-200'
                    }`}
                    style={{
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={clearFilters}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    colors.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                  } ${colors.text}`}
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
};

