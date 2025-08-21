import { motion } from "framer-motion";
import { Download, Plus, FileText, Brain, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComparisonResponse } from "@shared/schema";

interface UploadedFile {
  file: File;
  documentId?: string;
  processing?: boolean;
  processed?: boolean;
  extractedText?: string;
  summary?: string;
  error?: string;
}

interface ResultsSectionProps {
  document1: UploadedFile;
  document2: UploadedFile;
  comparisonResult: ComparisonResponse | null;
  onNewAnalysis: () => void;
}

export default function ResultsSection({ 
  document1, 
  document2, 
  comparisonResult, 
  onNewAnalysis 
}: ResultsSectionProps) {
  
  const formatFileStats = (file: UploadedFile) => {
    const text = file.extractedText || '';
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    const pageEstimate = Math.max(1, Math.ceil(charCount / 2000)); // Rough estimate
    
    return { wordCount, charCount, pageEstimate };
  };

  const doc1Stats = formatFileStats(document1);
  const doc2Stats = formatFileStats(document2);

  const handleExport = () => {
    // Create a comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      documents: {
        document1: {
          name: document1.file.name,
          summary: document1.summary,
          stats: doc1Stats,
        },
        document2: {
          name: document2.file.name,
          summary: document2.summary,
          stats: doc2Stats,
        }
      },
      comparison: comparisonResult,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pdf-analysis-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Analysis Results</h2>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleExport}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button 
            onClick={onNewAnalysis}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Document 1 Summary */}
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Document 1 Summary</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>{document1.file.name}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Pages:</span> {doc1Stats.pageEstimate} | 
              <span className="font-medium"> Words:</span> {doc1Stats.wordCount.toLocaleString()} | 
              <span className="font-medium"> Characters:</span> {doc1Stats.charCount.toLocaleString()}
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">
                {document1.summary || "No summary available"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Brain className="h-4 w-4" />
                <span>AI Processed</span>
              </div>
              <Button variant="ghost" size="sm" className="text-black hover:text-gray-600">
                View Full Text →
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Document 2 Summary */}
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Document 2 Summary</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>{document2.file.name}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Pages:</span> {doc2Stats.pageEstimate} | 
              <span className="font-medium"> Words:</span> {doc2Stats.wordCount.toLocaleString()} | 
              <span className="font-medium"> Characters:</span> {doc2Stats.charCount.toLocaleString()}
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">
                {document2.summary || "No summary available"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Brain className="h-4 w-4" />
                <span>AI Processed</span>
              </div>
              <Button variant="ghost" size="sm" className="text-black hover:text-gray-600">
                View Full Text →
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Analysis */}
      {comparisonResult && comparisonResult.success && (
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-black mb-6">Comparative Analysis</h3>
          
          {/* Similarity Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 font-medium">Document Similarity</span>
              <span className="text-lg font-bold text-black">
                {comparisonResult.similarityScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-black h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${comparisonResult.similarityScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {comparisonResult.analysis}
            </p>
          </div>

          {/* Key Differences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-black mb-3">Key Similarities</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {comparisonResult.similarities?.map((similarity, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CheckCircle className="text-green-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{similarity}</span>
                  </motion.li>
                )) || []}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-3">Key Differences</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {comparisonResult.differences?.map((difference, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <AlertCircle className="text-orange-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{difference}</span>
                  </motion.li>
                )) || []}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Summary */}
      <motion.div 
        className="bg-gray-50 rounded-xl p-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-black mb-4">Processing Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">
              {(comparisonResult?.tokensUsed || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Tokens Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black">
              ${(comparisonResult?.estimatedCost || 0).toFixed(3)}
            </div>
            <div className="text-sm text-gray-600">Estimated Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black">
              {(comparisonResult?.processingTime || 0).toFixed(1)}s
            </div>
            <div className="text-sm text-gray-600">Processing Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black">
              {comparisonResult?.success ? '100%' : '0%'}
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
