import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Settings, CheckCircle } from "lucide-react";
import UploadBox from "@/components/upload-box";
import ProcessingStatus from "@/components/processing-status";
import ResultsSection from "@/components/results-section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { uploadPdf, compareDocuments } from "@/lib/api";
import type { ProcessingResponse, ComparisonResponse } from "@shared/schema";

interface UploadedFile {
  file: File;
  documentId?: string;
  processing?: boolean;
  processed?: boolean;
  extractedText?: string;
  summary?: string;
  error?: string;
}

interface ProcessingOptions {
  extract: boolean;
  summarize: boolean;
  compare: boolean;
}

export default function Home() {
  const [files, setFiles] = useState<{
    document1: UploadedFile | null;
    document2: UploadedFile | null;
  }>({
    document1: null,
    document2: null,
  });

  const [options, setOptions] = useState<ProcessingOptions>({
    extract: true,
    summarize: true,
    compare: true,
  });

  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'upload' | 'extract' | 'analyze' | 'compare'>('upload');
  const [progress, setProgress] = useState(0);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { toast } = useToast();

  const handleFileUpload = (documentId: 'document1' | 'document2', file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => ({
      ...prev,
      [documentId]: {
        file,
        processing: false,
        processed: false,
      }
    }));
  };

  const handleRemoveFile = (documentId: 'document1' | 'document2') => {
    setFiles(prev => ({
      ...prev,
      [documentId]: null
    }));
  };

  const processDocuments = async () => {
    if (!files.document1 || !files.document2) {
      toast({
        title: "Missing files",
        description: "Please upload both documents before processing.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProcessStep('upload');
    setShowResults(false);

    try {
      // Step 1: Upload completed
      setProgress(25);
      
      // Step 2: Extract text
      setProcessStep('extract');
      setProgress(50);

      const [result1, result2] = await Promise.all([
        uploadPdf(files.document1.file),
        uploadPdf(files.document2.file)
      ]);

      if (!result1.success || !result2.success) {
        throw new Error(result1.message || result2.message || 'Failed to process PDFs');
      }

      // Update files with processing results
      setFiles(prev => ({
        document1: prev.document1 ? {
          ...prev.document1,
          documentId: result1.documentId,
          extractedText: result1.extractedText,
          summary: result1.summary,
          processed: true,
        } : null,
        document2: prev.document2 ? {
          ...prev.document2,
          documentId: result2.documentId,
          extractedText: result2.extractedText,
          summary: result2.summary,
          processed: true,
        } : null,
      }));

      // Step 3: Analyze completed
      setProcessStep('analyze');
      setProgress(75);

      // Step 4: Compare documents if option is enabled
      if (options.compare && result1.documentId && result2.documentId) {
        setProcessStep('compare');
        
        const comparisonRes = await compareDocuments(result1.documentId, result2.documentId);
        
        if (!comparisonRes.success) {
          throw new Error(comparisonRes.message || 'Failed to compare documents');
        }

        setComparisonResult(comparisonRes);
      }

      setProgress(100);
      
      // Show results after a brief delay
      setTimeout(() => {
        setProcessing(false);
        setShowResults(true);
      }, 1000);

      toast({
        title: "Processing complete",
        description: "Your documents have been analyzed successfully.",
      });

    } catch (error) {
      console.error('Processing error:', error);
      setProcessing(false);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setFiles({ document1: null, document2: null });
    setProcessing(false);
    setShowResults(false);
    setProgress(0);
    setProcessStep('upload');
    setComparisonResult(null);
  };

  const canProcess = files.document1 && files.document2 && !processing;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <FileText className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">PDF Analyzer</h1>
                <p className="text-xs text-gray-500">Document Processing Platform</p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>API Connected</span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title Section */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-black mb-3">Compare & Analyze Documents</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload two PDF documents to extract text, generate summaries, and perform intelligent comparisons using advanced AI.
              </p>
            </motion.div>

            {/* Upload Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <UploadBox
                  documentId="document1"
                  title="Document 1"
                  file={files.document1}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={handleRemoveFile}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <UploadBox
                  documentId="document2"
                  title="Document 2"
                  file={files.document2}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={handleRemoveFile}
                />
              </motion.div>
            </div>

            {/* Processing Options */}
            <motion.div 
              className="bg-gray-50 rounded-xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-black mb-4">Processing Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="extract"
                    checked={options.extract}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, extract: checked as boolean }))
                    }
                  />
                  <label htmlFor="extract" className="text-gray-700 cursor-pointer">Extract Text</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="summarize"
                    checked={options.summarize}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, summarize: checked as boolean }))
                    }
                  />
                  <label htmlFor="summarize" className="text-gray-700 cursor-pointer">Generate Summary</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="compare"
                    checked={options.compare}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, compare: checked as boolean }))
                    }
                  />
                  <label htmlFor="compare" className="text-gray-700 cursor-pointer">Compare Documents</label>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button
                onClick={processDocuments}
                disabled={!canProcess}
                className="bg-black text-white px-8 py-3 hover:bg-gray-800 disabled:opacity-50"
                size="lg"
              >
                <Settings className="mr-2 h-4 w-4" />
                Process Documents
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="px-8 py-3"
                size="lg"
              >
                Clear All
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Processing Status */}
        {processing && (
          <ProcessingStatus
            step={processStep}
            progress={progress}
          />
        )}

        {/* Results Section */}
        {showResults && files.document1 && files.document2 && (
          <ResultsSection
            document1={files.document1}
            document2={files.document2}
            comparisonResult={comparisonResult}
            onNewAnalysis={clearAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <FileText className="text-white h-4 w-4" />
                </div>
                <span className="font-bold text-black">PDF Analyzer</span>
              </div>
              <p className="text-gray-600 text-sm">Advanced document processing and analysis platform powered by AI.</p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Text Extraction & OCR</li>
                <li>AI-Powered Summarization</li>
                <li>Document Comparison</li>
                <li>Secure Processing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>&copy; 2024 PDF Analyzer. Built with FastAPI & modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
