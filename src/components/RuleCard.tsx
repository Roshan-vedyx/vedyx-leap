import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Lightbulb, ArrowRight } from 'lucide-react';

interface RuleCardProps {
  id: string;
  title: string;
  body: string;
  visual?: string;
  examplePairs?: { before: string; after: string; }[];
  onComplete?: () => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ 
  title, 
  body, 
  visual, 
  examplePairs = [],
  onComplete 
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const nextExample = () => {
    if (currentExampleIndex < examplePairs.length - 1) {
      setCurrentExampleIndex(prev => prev + 1);
    } else {
      setCurrentExampleIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-6 md:p-8"
      >
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-block mb-4"
          >
            <Lightbulb className="w-12 h-12 text-yellow-500" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto"></div>
        </div>

        {/* Visual Aid */}
        {visual && (
          <div className="text-center mb-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              src={visual}
              alt={`Visual aid for ${title}`}
              className="max-w-md mx-auto rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Main Rule Explanation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8"
        >
          <p className="text-xl md:text-2xl leading-relaxed text-gray-800 text-center font-medium">
            {body}
          </p>
        </motion.div>

        {/* Examples Section */}
        {examplePairs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="w-full flex items-center justify-between bg-mint-100 rounded-2xl p-4 hover:bg-mint-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mint-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Ex</span>
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  See Examples ({examplePairs.length})
                </span>
              </div>
              <motion.div
                animate={{ rotate: showExamples ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-6 h-6 text-mint-600 group-hover:text-mint-700" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showExamples && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="bg-white border-2 border-mint-200 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Example {currentExampleIndex + 1} of {examplePairs.length}
                      </h3>
                      
                      <motion.div 
                        key={currentExampleIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-center gap-6 mb-6"
                      >
                        {/* Before */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-red-100 rounded-2xl p-4 min-w-[120px]"
                        >
                          <div className="text-sm text-red-600 font-medium mb-1">Before</div>
                          <div className="text-2xl font-bold text-red-800">
                            {examplePairs[currentExampleIndex].before}
                          </div>
                        </motion.div>

                        {/* Arrow */}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="w-8 h-8 text-mint-500" />
                        </motion.div>

                        {/* After */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="bg-green-100 rounded-2xl p-4 min-w-[120px]"
                        >
                          <div className="text-sm text-green-600 font-medium mb-1">After</div>
                          <div className="text-2xl font-bold text-green-800">
                            {examplePairs[currentExampleIndex].after}
                          </div>
                        </motion.div>
                      </motion.div>

                      {examplePairs.length > 1 && (
                        <button
                          onClick={nextExample}
                          className="px-6 py-3 bg-mint-500 text-white rounded-2xl font-medium hover:bg-mint-600 transition-all transform hover:scale-105 active:scale-95"
                        >
                          {currentExampleIndex === examplePairs.length - 1 ? 'Back to First' : 'Next Example'}
                        </button>
                      )}
                    </div>

                    {/* Example Dots */}
                    {examplePairs.length > 1 && (
                      <div className="flex justify-center gap-2">
                        {examplePairs.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentExampleIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentExampleIndex
                                ? 'bg-mint-500 scale-125'
                                : 'bg-mint-300 hover:bg-mint-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-mint-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            Got it! Let's practice! 🚀
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 opacity-20">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-12 h-12 border-4 border-dashed border-yellow-400 rounded-full"
          />
        </div>
        
        <div className="absolute bottom-4 right-4 opacity-20">
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-8 h-8 border-4 border-dashed border-blue-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default RuleCard;