import React, { useState } from 'react';
import { Trash2, Download, CheckSquare, Square } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';

interface File {
  id: number;
  originalName: string;
  size: number;
  uploadedAt: string;
}

interface BulkFileOperationsProps {
  files: File[];
  onDelete: (ids: number[]) => Promise<void>;
  onExport: (ids: number[]) => Promise<void>;
}

export const BulkFileOperations: React.FC<BulkFileOperationsProps> = ({
  files,
  onDelete,
  onExport,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === files.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(files.map((f) => f.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} file(s)? This action cannot be undone.`)) {
      return;
    }
    setIsProcessing(true);
    try {
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    try {
      await onExport(Array.from(selectedIds));
    } catch (error) {
      console.error('Bulk export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg ${glassmorphismClass}`}
          style={{
            backgroundColor: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${colors.accent}40`,
          }}
        >
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${colors.text}`}>
              {selectedIds.size} file(s) selected
            </span>
            <button
              onClick={selectAll}
              className={`text-sm ${colors.textSecondary} hover:${colors.text} transition-colors`}
            >
              {selectedIds.size === files.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExport}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Files List with Checkboxes */}
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedIds.has(file.id)
                ? colors.isDark
                  ? 'bg-blue-500/20'
                  : 'bg-blue-100'
                : colors.isDark
                ? 'hover:bg-white/5'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleSelect(file.id)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(file.id);
              }}
              className="p-1"
              aria-label={selectedIds.has(file.id) ? 'Deselect' : 'Select'}
            >
              {selectedIds.has(file.id) ? (
                <CheckSquare className="w-5 h-5" style={{ color: colors.accent }} />
              ) : (
                <Square className="w-5 h-5" style={{ color: colors.textSecondary }} />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${colors.text}`}>
                {file.originalName}
              </p>
              <p className={`text-xs ${colors.textSecondary}`}>
                {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

