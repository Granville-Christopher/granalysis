import React, { useState, DragEvent } from "react";

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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="relative w-full max-w-lg p-8 rounded-xl border-2 border-dashed bg-white dark:bg-gray-800 shadow-xl flex flex-col items-center"
        style={{ minHeight: 400 }}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl z-50 transition-colors"
          type="button"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
          Upload a File
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Upload your CSV, Excel, or SQL files and instantly preview, analyze,
          and export results.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.sql"
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
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm sm:text-base">
                Selected File:{" "}
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {file.name}
                </span>
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
                >
                  Clear File
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                >
                  Submit File
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                dragActive ? "opacity-80" : ""
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {dragActive
                ? "Drop your file here"
                : "Click to upload or drag a file here"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default FileUploadOverlay;
