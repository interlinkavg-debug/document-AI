import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  step: 'upload' | 'extract' | 'analyze' | 'compare';
  progress: number;
}

const steps = [
  { key: 'upload', label: 'Files uploaded successfully' },
  { key: 'extract', label: 'Extracting text content...' },
  { key: 'analyze', label: 'Generating summaries and analysis' },
  { key: 'compare', label: 'Comparing documents' },
];

export default function ProcessingStatus({ step, progress }: ProcessingStatusProps) {
  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Processing Documents</h3>
          <div className="flex items-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-black rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          {steps.map((stepItem, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <motion.div 
                key={stepItem.key}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isCurrent 
                      ? 'bg-black' 
                      : 'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="text-white text-xs w-4 h-4" />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="text-white text-xs w-3 h-3" />
                    </motion.div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  )}
                </div>
                <span className={`${
                  isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {stepItem.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-black h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
