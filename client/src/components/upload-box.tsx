import { useRef } from "react";
import { motion } from "framer-motion";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  file: File;
  documentId?: string;
  processing?: boolean;
  processed?: boolean;
  extractedText?: string;
  summary?: string;
  error?: string;
}

interface UploadBoxProps {
  documentId: 'document1' | 'document2';
  title: string;
  file: UploadedFile | null;
  onFileUpload: (documentId: 'document1' | 'document2', file: File) => void;
  onRemoveFile: (documentId: 'document1' | 'document2') => void;
}

export default function UploadBox({ documentId, title, file, onFileUpload, onRemoveFile }: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileUpload(documentId, droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileUpload(documentId, selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="upload-box">
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
          file 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 hover:border-black hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {!file ? (
          <>
            <motion.div 
              className="mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                <CloudUpload className="text-2xl" />
              </div>
            </motion.div>
            <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">Drag & drop your PDF here or click to browse</p>
            <div className="text-sm text-gray-500">
              <p>Supported: PDF files up to 10MB</p>
              <p>OCR enabled for scanned documents</p>
            </div>
          </>
        ) : (
          <motion.div 
            className="mt-4 p-4 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="text-red-500 text-xl" />
                <div className="text-left">
                  <p className="font-medium text-black">{file.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.file.size)}</p>
                  {file.processed && (
                    <motion.div
                      className="text-xs text-green-600 flex items-center mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ✓ Processed
                    </motion.div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(documentId);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
