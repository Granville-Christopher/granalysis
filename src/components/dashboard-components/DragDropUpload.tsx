import React, { useState, useCallback, DragEvent } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from '../home/theme';
import { ProgressBar } from '../common/ProgressBar';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  multiple?: boolean;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['.csv', '.xlsx', '.xls', '.json', '.sql'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
}) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glassmorphismClass = getGlassmorphismClass(colors);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Check file type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      return `File "${file.name}" has unsupported type. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      if (multiple) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        validFiles.forEach((file) => onFileSelect(file));
      } else {
        setSelectedFiles([validFiles[0]]);
        onFileSelect(validFiles[0]);
      }
    }
  }, [onFileSelect, multiple, maxSize, acceptedTypes]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-105'
            : colors.isDark
            ? 'border-white/20 bg-white/5'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',') + ",text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json,text/json,application/sql,text/sql,text/plain"}
          onChange={handleFileInput}
          multiple={multiple}
          className="hidden"
          id="drag-drop-upload"
        />
        <label
          htmlFor="drag-drop-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload
            className={`w-12 h-12 mb-4 transition-transform ${
              isDragging ? 'scale-110' : ''
            }`}
            style={{ color: colors.accent }}
          />
          <p className={`text-lg font-semibold mb-2 ${colors.text}`}>
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className={`text-sm ${colors.textSecondary} mb-4`}>
            or <span className="text-blue-500 underline">browse</span> to upload
          </p>
          <p className={`text-xs ${colors.textSecondary}`}>
            Supported: {acceptedTypes.join(', ')} (Max: {(maxSize / 1024 / 1024).toFixed(1)}MB)
          </p>
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${glassmorphismClass}`}
              style={{
                backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5" style={{ color: colors.accent }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${colors.text}`}>{file.name}</p>
                  <p className={`text-xs ${colors.textSecondary}`}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {uploadProgress[file.name] === 100 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                <div className="w-32 ml-4">
                  <ProgressBar progress={uploadProgress[file.name]} size="sm" />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((error, index) => (
            <div
              key={index}
              className="p-2 rounded bg-red-500/10 border border-red-500/20"
            >
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

