import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Upload, FileText, Moon, Sun, X, Database, Download, Calendar, Archive } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../utils/axios";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { toast } from '../../utils/toast';

interface FilterOptions {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  fileType?: string;
  minSize?: number;
  maxSize?: number;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onUploadClick?: () => void;
  refreshKey?: number;
  onFileSelect?: (fileId: number) => void;
  selectedFileId?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: { pricingTier?: string } | null;
  onLinkDatabaseClick?: () => void;
  onScheduleExports?: (fileId: number) => void;
  filterOptions?: FilterOptions;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onUploadClick,
  refreshKey,
  onFileSelect,
  selectedFileId,
  isCollapsed = false,
  onToggleCollapse,
  user,
  onLinkDatabaseClick,
  onScheduleExports,
  filterOptions = {},
}) => {
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<any>>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { isDark, toggleTheme } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  const fetchFiles = useCallback(async () => {
    try {
      console.log('[Sidebar] Fetching files...');

      const res = await api.get('/files', {
        params: { _t: Date.now() }, 
        headers: { 'Cache-Control': 'no-cache' },
      });
      console.log('[Sidebar] Files response status:', res.status);
      console.log('[Sidebar] Files response data:', res.data);
      
      // Handle different response formats
      let files: any[] = [];
      if (res.data?.status === 'success' && res.data?.files) {
        files = res.data.files;
      } else if (Array.isArray(res.data)) {
        // Sometimes the API returns an array directly
        files = res.data;
      } else if (res.data?.files && Array.isArray(res.data.files)) {
        // Handle case where files is directly in data
        files = res.data.files;
      }
      
      console.log('[Sidebar] Setting files:', files.length, 'files');
      console.log('[Sidebar] File IDs:', files.map((f: any) => f.id));
      console.log('[Sidebar] Files data:', files);
      setUploadedFiles(files);
    } catch (e: any) {
      console.error('[Sidebar] Failed to fetch files:', e);
      console.error('[Sidebar] Error status:', e.response?.status);
      console.error('[Sidebar] Error status text:', e.response?.statusText);
      console.error('[Sidebar] Error data:', e.response?.data);
      console.error('[Sidebar] Error message:', e.message);
      console.error('[Sidebar] Full error:', e);
      
      // Set empty array on error to prevent undefined state
      setUploadedFiles([]);
    }
  }, []);

  useEffect(() => {
    console.log('[Sidebar] useEffect triggered, refreshKey:', refreshKey);
    fetchFiles();
  }, [refreshKey, fetchFiles]);

  const filteredFiles = useMemo(() => {
    // Filter out archived files from main list
    let filtered = uploadedFiles.filter(file => file.status !== 'archived');

    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      filtered = filtered.filter(file => 
        file.originalName?.toLowerCase().includes(searchLower)
      );
    }

    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom);
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.uploadedAt);
        return fileDate >= fromDate;
      });
    }
    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo);
      toDate.setHours(23, 59, 59, 999); 
      filtered = filtered.filter(file => {
        const fileDate = new Date(file.uploadedAt);
        return fileDate <= toDate;
      });
    }

    if (filterOptions.fileType) {
      const ext = filterOptions.fileType.toLowerCase();
      filtered = filtered.filter(file => {
        const fileName = file.originalName?.toLowerCase() || '';
        if (ext === 'csv') return fileName.endsWith('.csv');
        if (ext === 'xlsx') return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        if (ext === 'json') return fileName.endsWith('.json');
        if (ext === 'sql') return fileName.endsWith('.sql');
        return true;
      });
    }

    if (filterOptions.minSize !== undefined) {
      filtered = filtered.filter(file => (file.size || 0) >= filterOptions.minSize! * 1024);
    }
    if (filterOptions.maxSize !== undefined) {
      filtered = filtered.filter(file => (file.size || 0) <= filterOptions.maxSize! * 1024);
    }

    return filtered;
  }, [uploadedFiles, filterOptions]);

  const handleFileDelete = async (id: number) => {
    try {
      await api.delete(`/files/${id}`);
      await fetchFiles();
      setDropdownId(null);
    } catch (e) {
      console.error('Delete failed', e);
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      setDropdownId(null);
    }
  };

  const toggleDropdown = (id: number) => {
    setDropdownId(dropdownId === id ? null : id);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${isCollapsed ? "w-20" : "w-64"}`}
        role="navigation"
        aria-label="File navigation sidebar"
      >
      <div
        className={`${glassmorphismClass} rounded-none h-full flex flex-col transition-all duration-300`}
        style={{
          backgroundColor: colors.isDark ? 'rgba(11, 27, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          boxShadow: colors.cardShadow,
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          {!isCollapsed && (
            <span className={`text-lg font-bold tracking-wide ${colors.text}`}>Files</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              className={`p-2 rounded-full transition-all duration-200 ${
                colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-5 h-5" style={{ color: colors.accent }} /> : <Moon className="w-5 h-5" style={{ color: colors.accent }} />}
            </button>
            {onToggleCollapse && (
              <button
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  colors.isDark ? "hover:bg-white/15 bg-white/5" : "hover:bg-gray-200 bg-gray-100"
                }`}
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                style={{
                  boxShadow: isCollapsed 
                    ? `0 2px 4px ${colors.accent}30`
                    : `0 2px 4px ${colors.accent}20`
                }}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5" style={{ color: colors.accent, fontWeight: 'bold' }} />
                ) : (
                  <ChevronLeft className="w-5 h-5" style={{ color: colors.accent, fontWeight: 'bold' }} />
                )}
              </button>
            )}
            <button
              className="md:hidden p-2 rounded-full transition-colors"
              onClick={() => setIsSidebarOpen(false)}
              style={{ color: colors.accent }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Files List */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {uploadedFiles.length === 0 ? (
            <div className={`text-sm text-center ${colors.textSecondary} px-2`}>
              {!isCollapsed && "No files uploaded yet"}
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredFiles.map((file: any) => (
                <li
                  key={file.id}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 ${
                    selectedFileId === file.id
                      ? colors.isDark
                        ? "bg-white/10"
                        : "bg-blue-100"
                      : colors.isDark
                      ? "hover:bg-white/5"
                      : "hover:bg-gray-100"
                  }`}
                  style={{
                    border: selectedFileId === file.id ? `1px solid ${colors.accent}` : "1px solid transparent",
                  }}
                >
                  <FileText
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: selectedFileId === file.id ? colors.accent : colors.isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
                  />
                  {!isCollapsed && (
                    <>
                      <button
                        className={`truncate text-left flex-1 text-sm ${colors.text}`}
                        onClick={() => onFileSelect?.(file.id)}
                      >
                        {file.originalName}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(file.id)}
                          className={`p-1 rounded transition-colors ${
                            colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
                          }`}
                        >
                          <span className="material-icons text-sm">more_vert</span>
                        </button>
                        {dropdownId === file.id && (
                          <div
                            className={`absolute right-0 mt-2 w-48 ${glassmorphismClass} z-40 rounded-lg overflow-hidden`}
                            style={{ boxShadow: colors.cardShadow }}
                          >
                            {(user?.pricingTier === 'business' || user?.pricingTier === 'enterprise') && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/v1/files/${file.id}/export?format=csv`, { credentials: 'include' });
                                      if (!res.ok) throw new Error('Export failed');
                                      const blob = await res.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${file.originalName.replace(/\.[^/.]+$/, '')}-export.csv`;
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                      window.URL.revokeObjectURL(url);
                                      setDropdownId(null);
                                    } catch (e) {
                                      console.error('Export failed:', e);
                                      setDropdownId(null);
                                    }
                                  }}
                                  className={`block w-full text-left px-4 py-2 ${colors.text} flex items-center gap-2 ${
                                    colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                                  } transition-colors`}
                                  aria-label="Export file as CSV"
                                >
                                  <Download className="w-4 h-4" />
                                  Export CSV
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/v1/files/${file.id}/export?format=json`, { credentials: 'include' });
                                      if (!res.ok) throw new Error('Export failed');
                                      const blob = await res.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${file.originalName.replace(/\.[^/.]+$/, '')}-export.json`;
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                      window.URL.revokeObjectURL(url);
                                      setDropdownId(null);
                                    } catch (e) {
                                      console.error('Export failed:', e);
                                      setDropdownId(null);
                                    }
                                  }}
                                  className={`block w-full text-left px-4 py-2 ${colors.text} flex items-center gap-2 ${
                                    colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                                  } transition-colors border-t`}
                                  style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                  aria-label="Export file as JSON"
                                >
                                  <Download className="w-4 h-4" />
                                  Export JSON
                                </button>
                              </>
                            )}
                            {(user?.pricingTier === 'business' || user?.pricingTier === 'enterprise') && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/v1/files/${file.id}/export?format=pdf`, { credentials: 'include' });
                                    if (!res.ok) throw new Error('Export failed');
                                    const blob = await res.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${file.originalName.replace(/\.[^/.]+$/, '')}-export.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                    setDropdownId(null);
                                  } catch (e) {
                                    console.error('PDF export failed:', e);
                                    setDropdownId(null);
                                  }
                                }}
                                className={`block w-full text-left px-4 py-2 ${colors.text} flex items-center gap-2 ${
                                  colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                                } transition-colors border-t`}
                                style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                aria-label="Export file as PDF"
                              >
                                <Download className="w-4 h-4" />
                                Export PDF
                              </button>
                            )}
                            {(user?.pricingTier === 'business' || user?.pricingTier === 'enterprise') && (
                              <button
                                onClick={() => {
                                  setDropdownId(null);
                                  if (onScheduleExports) {
                                    onScheduleExports(file.id);
                                  }
                                }}
                                className={`block w-full text-left px-4 py-2 ${colors.text} flex items-center gap-2 ${
                                  colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                                } transition-colors border-t`}
                                style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                aria-label="Schedule exports"
                              >
                                <Calendar className="w-4 h-4" />
                                Schedule Exports
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                try {
                                  await api.post(`/archiving/files/${file.id}/archive`);
                                  // Remove file from list immediately (it's now archived)
                                  setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
                                  setDropdownId(null);
                                  // Refresh files list to ensure consistency
                                  setTimeout(() => fetchFiles(), 500);
                                } catch (e) {
                                  console.error('Archive failed:', e);
                                  toast.error('Failed to archive file');
                                  setDropdownId(null);
                                }
                              }}
                              className={`block w-full text-left px-4 py-2 ${colors.text} flex items-center gap-2 ${
                                colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                              } transition-colors border-t`}
                              style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                              aria-label="Archive file"
                            >
                              <Archive className="w-4 h-4" />
                              Archive
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(file.id);
                                setDropdownId(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-red-500 flex items-center gap-2 ${
                                colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                              } transition-colors border-t`}
                              style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                              aria-label="Delete file"
                            >
                              <X className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upload Button */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <button
            data-tutorial="upload-button"
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              colors.isDark
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            }`}
            style={{
              boxShadow: `0 4px 15px ${colors.accent}40`,
            }}
            onClick={onUploadClick}
            aria-label="Upload file"
          >
            <Upload className="w-5 h-5" />
            {!isCollapsed && <span>Upload File</span>}
          </button>
          
          {/* Link Database Button - Enterprise Only */}
          {user?.pricingTier === 'enterprise' && (
            <button
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                colors.isDark
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
                  : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
              }`}
              style={{
                boxShadow: `0 4px 15px ${colors.isDark ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.3)'}`,
              }}
              onClick={onLinkDatabaseClick}
            >
              <Database className="w-5 h-5" />
              {!isCollapsed && <span>Link Database</span>}
            </button>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div
            className={`relative z-10 ${glassmorphismClass} p-6 rounded-xl w-full max-w-sm`}
            style={{ boxShadow: colors.cardShadow }}
          >
            <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>Confirm delete</h3>
            <p className={`text-sm mb-4 ${colors.textSecondary}`}>
              Are you sure you want to delete this file? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${colors.textSecondary} ${
                  colors.isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                onClick={async () => {
                  await handleFileDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </aside>
    </>
  );
};

export default Sidebar;
