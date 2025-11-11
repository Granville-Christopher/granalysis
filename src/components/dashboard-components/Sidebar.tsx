import React, { useState, useEffect } from "react";
import useDarkMode from "../../hooks/useDarkMode";
import api from "../../utils/axios";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onUploadClick?: () => void;
  refreshKey?: number;
  onFileSelect?: (fileId: number) => void;
  selectedFileId?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onUploadClick,
  refreshKey,
  onFileSelect,
  selectedFileId
}) => {
  const [dropdownId, setDropdownId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<any>>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get('/files');
        if (res.data?.status === 'success') setUploadedFiles(res.data.files || []);
      } catch (e) {
        setUploadedFiles([]);
      }
    };
    fetchFiles();
  }, [refreshKey]);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      if (res.data?.status === 'success') setUploadedFiles(res.data.files || []);
    } catch (e) {
      setUploadedFiles([]);
    }
  };

  const handleFileDelete = async (id: number) => {
    try {
      await api.delete(`/files/${id}`);
      await fetchFiles();
      setDropdownId(null);
    } catch (e) {
      console.error('Delete failed', e);
      // fallback local removal
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      setDropdownId(null);
    }
  };

  const toggleDropdown = (id: number) => {
    setDropdownId(dropdownId === id ? null : id);
  };

  const [isDark, setIsDark] = useDarkMode();

  return (
    <aside
      className={`fixed top-28 md:top-0 left-0 md:h-full h-[51.5rem] w-64 bg-gray-50 text-black shadow-lg z-30 transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:block dark:bg-gray-800 dark:text-gray-50`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 shadow-sm">
          <span className="text-lg font-bold tracking-wide">Files</span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              onClick={() => setIsDark((d: boolean) => !d)}
            >
              <span className="material-icons">
                {isDark ? "dark_mode" : "light_mode"}
              </span>
            </button>
            <button
              className="md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="space-y-2">
            {uploadedFiles.length === 0 ? (
              <li className="text-sm text-gray-600 dark:text-gray-300">No file uploaded yet — upload a file to get insights</li>
            ) : (
              uploadedFiles.map((file: any) => (
                <li
                  key={file.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                    selectedFileId === file.id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <button 
                    className="truncate text-left flex-1"
                    onClick={() => onFileSelect?.(file.id)}
                  >
                    {file.originalName}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(file.id)}
                      className="ml-2 focus:outline-none"
                    >
                      <span className="material-icons">more_vert</span>
                    </button>
                    {dropdownId === file.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded shadow-lg z-40">
                        <button
                          onClick={() => setConfirmDeleteId(file.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex flex-col gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
            onClick={onUploadClick}
          >
            <span className="material-icons">upload_file</span> Upload File
          </button>
        </div>
      </div>
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={async () => { await handleFileDelete(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
