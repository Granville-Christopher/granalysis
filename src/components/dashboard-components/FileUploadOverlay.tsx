import React, { useState, DragEvent } from "react";
import { X, Upload as UploadIcon } from "lucide-react";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";
import { useTheme } from "../../contexts/ThemeContext";

interface FileUploadOverlayProps {
  onFileUploaded: (file: File) => void;
  onClose: () => void;
}

const FileUploadOverlay: React.FC<FileUploadOverlayProps> = ({
  onFileUploaded,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      // Do not auto-submit
    }
  };

  const handleDrag = (
    e: DragEvent<HTMLDivElement>,
    isActive: boolean
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(isActive);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      // Do not auto-submit
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onFileUploaded(file);
    }
  };

  const handleClearFile = (): void => {
    setFile(null);
  };

  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div
        className={`relative w-full max-w-lg p-8 rounded-xl border-2 border-dashed flex flex-col items-center ${glassmorphismClass}`}
        style={{ 
          minHeight: 400,
          boxShadow: colors.cardShadow,
          borderColor: colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
        }}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-50 ${
            colors.isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>
          Upload a File
        </h2>
        <p className={`${colors.textSecondary} mb-6 text-center`}>
          Upload your CSV, Excel, JSON, SQL, or PHP files and instantly preview, analyze,
          and export results.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.sql,.php,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json,text/json,application/sql,text/sql,text/plain"
          onChange={handleFileChange}
          className="hidden"
          tabIndex={-1}
        />
        <form
          className="flex flex-col items-center justify-center w-full"
          onSubmit={handleSubmit}
        >
          {file ? (
            <div className="flex flex-col items-center space-y-4">
              <p className={`${colors.text} font-medium text-sm sm:text-base`}>
                Selected File:{" "}
                <span className="font-semibold" style={{ color: colors.accent }}>
                  {file.name}
                </span>
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all duration-200"
                  style={{ boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                >
                  Clear File
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                    boxShadow: `0 4px 15px ${colors.accent}40`,
                  }}
                >
                  Submit File
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white flex items-center gap-2 ${
                dragActive ? "opacity-80" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                boxShadow: `0 4px 15px ${colors.accent}40`,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="w-5 h-5" />
              <span>
                {dragActive
                  ? "Drop your file here"
                  : "Click to upload or drag a file here"}
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default FileUploadOverlay;
